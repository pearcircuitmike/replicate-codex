// pages/api/chat/stream.js

import { smoothStream, streamText, createDataStreamResponse } from "ai";
import { openai } from "@ai-sdk/openai";
import supabase from "@/pages/api/utils/supabaseClient";
import { formatRagContext, createSystemPrompt } from "../lib/context";
import { getRelevantContext } from "../lib/retriever";

// Configuration
const CONFIG = {
  limits: {
    maxContextSize: 10, // Max number of context items to include
  },
};

export const config = {
  runtime: "edge",
};

// Utility for consistent timestamped logging
function logWithTimestamp(type, message, data = null) {
  const timestamp = new Date().toISOString();
  const logPrefix = `[${timestamp}] [${type}]`;

  if (data) {
    console.log(`${logPrefix} ${message}`, data);
  } else {
    console.log(`${logPrefix} ${message}`);
  }
}

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Set up headers for the response
  const headers = {
    "Cache-Control": "no-cache",
  };

  try {
    logWithTimestamp("DEBUG", "Starting request handler");

    // Parse request
    const body = await req.json();
    const {
      messages = [],
      userId,
      sessionId = null,
      model = "gpt-4o-mini",
      ragEnabled = true,
    } = body;

    logWithTimestamp("INFO", "Request parsed", {
      userId,
      sessionId,
      messageCount: messages.length,
      model,
      ragEnabled,
    });

    if (!userId || !messages.length) {
      logWithTimestamp("ERROR", "Missing user ID or messages");
      return new Response("Missing user ID or messages", { status: 400 });
    }

    const userMessage = messages[messages.length - 1];
    if (userMessage.role !== "user") {
      logWithTimestamp("ERROR", "Last message not from user");
      return new Response("Last message must be from the user", {
        status: 400,
      });
    }

    // Get or create session
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      logWithTimestamp("INFO", "Creating new session");
      activeSessionId = await createSession(messages, userId);
      logWithTimestamp("INFO", "Session created", { activeSessionId });
    }

    // Save user message
    if (activeSessionId) {
      logWithTimestamp("INFO", "Saving user message", { activeSessionId });
      await saveUserMessage(activeSessionId, userMessage.content);
    }

    // Add session ID to headers if available
    if (activeSessionId) {
      headers["X-Session-Id"] = activeSessionId;
    }

    return createDataStreamResponse({
      headers,
      execute: async (dataStream) => {
        try {
          // Initial loading indicator
          dataStream.writeData({
            type: "status",
            content: "Searching for relevant papers and models...",
          });

          // Get relevant context
          logWithTimestamp("INFO", "Retrieving context");
          const ragContext = await getRelevantContext(
            userMessage.content,
            CONFIG.limits.maxContextSize
          );

          logWithTimestamp("INFO", "Context retrieved", {
            paperCount: ragContext?.papers?.length || 0,
            modelCount: ragContext?.models?.length || 0,
          });

          // Stream papers as sources
          if (ragContext?.papers) {
            for (const paper of ragContext.papers) {
              dataStream.writeData({
                type: "source",
                title: paper.title,
                url: paper.paperUrl || null,
                abstract: paper.abstract?.substring(0, 200) + "..." || null,
              });
            }
          }

          // Stream models
          if (ragContext?.models) {
            for (const model of ragContext.models) {
              dataStream.writeData({
                type: "model",
                name: model.modelName,
                description:
                  model.description?.substring(0, 200) + "..." || null,
              });
            }
          }

          // Prepare system prompt
          const contextString = formatRagContext(ragContext);
          const systemPrompt = createSystemPrompt(
            contextString,
            userMessage.content
          );
          logWithTimestamp("DEBUG", "System prompt created", {
            promptLength: systemPrompt.length,
          });

          // Prepare messages for AI
          const messagesToSend = [
            { role: "system", content: systemPrompt },
            ...messages.slice(0, -1), // Previous messages
            userMessage, // Latest user message
          ];

          logWithTimestamp("INFO", "Sending request to AI", {
            modelUsed: model,
            messageCount: messagesToSend.length,
          });

          // Create AI response stream
          const aiStream = streamText({
            model: openai(model),
            messages: messagesToSend,
            experimental_transform: smoothStream(),
          });

          // Clone for saving to DB
          const responseClone = aiStream.toDataStreamResponse();

          // Process in parallel for saving to DB
          fullProcessResponse(responseClone, activeSessionId, ragContext).then(
            (fullContent) => {
              if (fullContent && fullContent.length > 0) {
                logWithTimestamp("INFO", "Collected full response", {
                  contentLength: fullContent.length,
                  sessionId: activeSessionId,
                });

                try {
                  if (activeSessionId) {
                    logWithTimestamp("INFO", "Saving assistant message to DB", {
                      sessionId: activeSessionId,
                      contentPreview: fullContent.substring(0, 50) + "...",
                    });

                    saveMessage({
                      session_id: activeSessionId,
                      role: "assistant",
                      content: fullContent,
                      rag_context: ragContext || null,
                    }).then((savedMessage) => {
                      logWithTimestamp(
                        "INFO",
                        "Assistant message saved successfully",
                        {
                          messageId: savedMessage?.id,
                        }
                      );
                    });
                  }
                } catch (saveError) {
                  logWithTimestamp(
                    "ERROR",
                    "Failed to save assistant message",
                    saveError
                  );
                }
              }
            }
          );

          // Merge AI response into data stream
          aiStream.mergeIntoDataStream(dataStream);
        } catch (error) {
          logWithTimestamp("ERROR", "Error in stream execution", {
            message: error.message,
            stack: error.stack,
          });
          // Write error to the stream
          dataStream.writeData({
            type: "error",
            message: error.message,
          });
        }
      },
    });
  } catch (error) {
    logWithTimestamp("ERROR", "Chat stream handler error", {
      message: error.message,
      stack: error.stack,
    });
    return new Response(`Error processing request: ${error.message}`, {
      status: 500,
    });
  }
}

// Process the full response with detailed logging
async function fullProcessResponse(response, sessionId, ragContext) {
  const startTime = Date.now();
  logWithTimestamp("DEBUG", "Starting response processing", { sessionId });

  try {
    // Read the entire response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let chunks = [];
    let bytesRead = 0;
    let partial = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        logWithTimestamp("DEBUG", "Stream reading complete");
        break;
      }

      bytesRead += value.length;
      const decoded = decoder.decode(value, { stream: true });
      chunks.push(decoded);
      partial += decoded;

      // Log progress periodically
      if (chunks.length % 5 === 0) {
        logWithTimestamp("DEBUG", "Stream reading progress", {
          chunksReceived: chunks.length,
          bytesRead,
          recentContent: decoded.substring(0, 20) + "...",
        });
      }
    }

    // Add final chunk with end-of-stream flag
    chunks.push(decoder.decode());
    const fullResponse = chunks.join("");

    logWithTimestamp("DEBUG", "Response stream fully read", {
      totalChunks: chunks.length,
      totalBytes: bytesRead,
      fullResponseLength: fullResponse.length,
      decodingTimeMs: Date.now() - startTime,
    });

    // Extract the actual content from AI SDK format
    logWithTimestamp("DEBUG", "Sample of raw response", {
      sample: fullResponse.substring(0, 200),
    });

    // AI-SDK specific format parsing
    const textRegex = /0:"([^"]*)"/g;
    let extractedContent = "";
    let match;
    let matchCount = 0;

    while ((match = textRegex.exec(fullResponse)) !== null) {
      extractedContent += match[1];
      matchCount++;
    }

    logWithTimestamp("DEBUG", "Content extraction complete", {
      matchCount,
      extractedLength: extractedContent.length,
      extractionTimeMs: Date.now() - startTime,
      sample: extractedContent.substring(0, 100) + "...",
    });

    // Alternative extraction method if first one failed
    if (extractedContent.length === 0) {
      logWithTimestamp(
        "WARN",
        "Primary extraction method yielded no content, trying alternatives"
      );

      // Try alternative pattern
      const altRegex = /"text":"([^"]*)"/g;
      while ((match = altRegex.exec(fullResponse)) !== null) {
        extractedContent += match[1];
        matchCount++;
      }

      logWithTimestamp("DEBUG", "Alternative extraction results", {
        matchCount,
        extractedLength: extractedContent.length,
      });

      // If still nothing, log the full response for debugging
      if (extractedContent.length === 0) {
        logWithTimestamp("ERROR", "Content extraction failed", {
          fullResponse: fullResponse,
        });
      }
    }

    return extractedContent;
  } catch (error) {
    logWithTimestamp("ERROR", "Error processing response stream", {
      message: error.message,
      stack: error.stack,
      sessionId,
    });
    return "";
  }
}

// Record RAG usage
async function recordRagUsage(userId, sessionId) {
  try {
    logWithTimestamp("INFO", "Recording RAG usage", { userId, sessionId });
    const { error } = await supabase.from("analytics_events").insert([
      {
        user_id: userId,
        session_id: sessionId,
        event_type: "ragchat",
        event_data: { session_id: sessionId },
      },
    ]);

    if (error) {
      logWithTimestamp("ERROR", "Failed to record RAG usage", error);
      throw error;
    }
    return true;
  } catch (error) {
    logWithTimestamp("ERROR", "Exception in recordRagUsage", error);
    return false;
  }
}

// Create a new session
async function createSession(messages, userId) {
  try {
    const title = getSessionTitle(messages);
    logWithTimestamp("INFO", "Creating new session", { userId, title });

    // Insert directly with Supabase
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert([
        {
          user_id: userId,
          title: title,
        },
      ])
      .select()
      .single();

    if (error) {
      logWithTimestamp("ERROR", "Failed to create session", error);
      throw error;
    }

    logWithTimestamp("INFO", "Session created successfully", {
      sessionId: data.id,
    });
    return data.id;
  } catch (error) {
    logWithTimestamp("ERROR", "Exception in createSession", error);
    return null;
  }
}

// Save a message directly to Supabase
async function saveMessage(messageData) {
  try {
    logWithTimestamp("INFO", "Saving message", {
      role: messageData.role,
      sessionId: messageData.session_id,
      contentLength: messageData.content?.length || 0,
    });

    const { data, error } = await supabase
      .from("chat_messages")
      .insert([messageData])
      .select();

    if (error) {
      logWithTimestamp("ERROR", "Supabase insert error", error);
      throw error;
    }

    // Update session timestamp
    logWithTimestamp("DEBUG", "Updating session timestamp", {
      sessionId: messageData.session_id,
    });

    const { error: updateError } = await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", messageData.session_id);

    if (updateError) {
      logWithTimestamp(
        "ERROR",
        "Error updating session timestamp",
        updateError
      );
    }

    logWithTimestamp("INFO", "Message saved successfully", {
      messageId: data[0]?.id,
    });
    return data[0];
  } catch (error) {
    logWithTimestamp("ERROR", "Exception in saveMessage", error);
    throw error;
  }
}

// Save user message
async function saveUserMessage(sessionId, content) {
  try {
    logWithTimestamp("INFO", "Saving user message", {
      sessionId,
      contentLength: content?.length || 0,
    });

    return await saveMessage({
      session_id: sessionId,
      role: "user",
      content,
    });
  } catch (error) {
    logWithTimestamp("ERROR", "Error saving user message", error);
    // Continue even if message save fails
  }
}

// Generate a title for a new session
function getSessionTitle(messages) {
  return messages.length > 0 && messages[0].role === "user"
    ? messages[0].content.substring(0, 50) +
        (messages[0].content.length > 50 ? "..." : "")
    : "New Chat";
}
