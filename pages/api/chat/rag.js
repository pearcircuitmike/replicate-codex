import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const config = {
  runtime: "edge",
};

export default async function handler(req, context) {
  console.log("[RAG] Handler started", { url: req.url });

  if (req.method !== "POST") {
    console.log("[RAG] Method not allowed", { method: req.method });
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const bodyString = await req.text();
    console.log("[RAG] Request body length", { length: bodyString.length });

    const parsed = JSON.parse(bodyString);
    const { messages = [], userId, userQuery, ragContext, sessionId } = parsed;
    console.log("[RAG] Request parsed", {
      userId,
      sessionId,
      messagesCount: messages.length,
    });

    if (!userId) {
      console.log("[RAG] Unauthorized - missing userId");
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    console.log("[RAG] Base URL", { baseUrl });

    // Get or create session
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      console.log("[RAG] Creating new session");
      activeSessionId = await createSession(baseUrl, messages, userId);
      console.log("[RAG] Session created", { activeSessionId });
    }

    // Save user message
    const latestUserMessage = messages[messages.length - 1];
    if (activeSessionId && latestUserMessage?.role === "user") {
      console.log("[RAG] Saving user message");
      await saveUserMessage(
        baseUrl,
        activeSessionId,
        latestUserMessage.content,
        userId
      );
      console.log("[RAG] User message saved");
    }

    // Prepare context and messages
    console.log("[RAG] Preparing context");
    const contextString = formatRagContext(ragContext);
    const systemPrompt = createSystemPrompt(contextString, userQuery);
    const messagesToSend = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Set up the transform stream for response processing
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Create response with headers
    const headers = new Headers();
    headers.set("Content-Type", "text/event-stream");
    if (activeSessionId) {
      headers.set("X-Session-Id", activeSessionId);
    }

    // Setup background processing that continues after response is sent
    if (context && typeof context.waitUntil === "function") {
      console.log("[RAG] Using context.waitUntil for background processing");
      context.waitUntil(
        processStreamAndSaveResponse(
          messagesToSend,
          writer,
          baseUrl,
          activeSessionId,
          userId,
          ragContext
        )
      );
    } else {
      console.log(
        "[RAG] No context.waitUntil available, using alternative approach"
      );
      // Alternative approach if waitUntil is not available
      const processingPromise = processStreamAndSaveResponse(
        messagesToSend,
        writer,
        baseUrl,
        activeSessionId,
        userId,
        ragContext
      );

      // Ensure promise doesn't get garbage collected
      processingPromise.catch((error) => {
        console.error("[RAG] Background processing error:", error);
      });
    }

    console.log("[RAG] Returning response stream");
    return new Response(readable, { headers });
  } catch (error) {
    console.error("[RAG] Fatal error:", error);
    return new Response(`Failed to process chat request: ${error.message}`, {
      status: 500,
    });
  }
}

// Process AI stream and save the response
async function processStreamAndSaveResponse(
  messages,
  writer,
  baseUrl,
  sessionId,
  userId,
  ragContext
) {
  console.log("[RAG] Processing stream started", { sessionId });
  let fullContent = "";

  try {
    // Generate AI response
    console.log("[RAG] Generating AI response");
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages,
    });

    // Process the response stream
    console.log("[RAG] Processing response stream");
    const response = result.toDataStreamResponse();
    const reader = response.body.getReader();
    const textDecoder = new TextDecoder();

    // Read and process all chunks
    let chunkCount = 0;
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log("[RAG] Stream processing complete", { chunkCount });
        break;
      }

      chunkCount++;
      // Forward to client
      await writer.write(value);

      // Extract text
      const chunk = textDecoder.decode(value, { stream: true });
      const extractedText = extractTextFromChunk(chunk);
      if (extractedText) {
        fullContent += extractedText;
      }

      if (chunkCount % 10 === 0) {
        console.log("[RAG] Processed chunks", {
          count: chunkCount,
          contentLength: fullContent.length,
        });
      }
    }

    // Close the writer when done reading
    console.log("[RAG] Closing writer");
    await writer.close();

    // Save the complete content
    if (sessionId && fullContent) {
      console.log("[RAG] Saving assistant response", {
        sessionId,
        contentLength: fullContent.length,
      });

      // Process content before saving
      const processedContent = processContent(fullContent);

      // Save assistant response
      console.log("[RAG] Sending save request to API");
      const saveStartTime = Date.now();
      const saveResponse = await fetch(`${baseUrl}/api/chat/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Connection: "keep-alive",
          Accept: "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          role: "assistant",
          content: processedContent,
          user_id: userId,
          rag_context: ragContext || null,
        }),
      });

      const saveEndTime = Date.now();
      console.log("[RAG] Save request completed", {
        status: saveResponse.status,
        duration: saveEndTime - saveStartTime,
      });

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        console.error("[RAG] Failed to save assistant message", {
          status: saveResponse.status,
          error: errorText,
        });
        throw new Error(
          `Failed to save assistant message: ${saveResponse.status} ${errorText}`
        );
      }

      const saveData = await saveResponse.json();
      console.log("[RAG] Assistant message saved successfully", {
        messageId: saveData.message?.id,
        sessionId,
      });
    }
  } catch (error) {
    console.error("[RAG] Error in processStreamAndSaveResponse:", error);

    // Ensure writer is closed on error
    try {
      await writer.close();
    } catch (e) {
      console.error("[RAG] Error closing writer:", e);
    }

    // Try one last save attempt if we have content
    if (sessionId && fullContent && fullContent.length > 0) {
      console.log("[RAG] Attempting final save after error");
      try {
        const finalSaveResponse = await fetch(`${baseUrl}/api/chat/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Connection: "keep-alive",
            Accept: "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            role: "assistant",
            content: processContent(fullContent),
            user_id: userId,
            rag_context: ragContext || null,
          }),
        });

        if (finalSaveResponse.ok) {
          console.log("[RAG] Final save attempt succeeded");
        } else {
          console.error("[RAG] Final save attempt failed", {
            status: finalSaveResponse.status,
          });
        }
      } catch (saveError) {
        console.error("[RAG] Final save attempt error:", saveError);
      }
    }

    throw error; // Re-throw for proper error handling
  }
}

// Create a new session
async function createSession(baseUrl, messages, userId) {
  try {
    const newSessionTitle = getSessionTitle(messages);
    console.log("[RAG] Creating session", { title: newSessionTitle });

    const sessionRes = await fetch(`${baseUrl}/api/chat/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        title: newSessionTitle,
      }),
    });

    if (!sessionRes.ok) {
      const errorText = await sessionRes.text();
      console.error("[RAG] Session creation failed", {
        status: sessionRes.status,
        error: errorText,
      });
      return null;
    }

    const sessionData = await sessionRes.json();
    console.log("[RAG] Session created", { sessionId: sessionData.session.id });
    return sessionData.session.id;
  } catch (error) {
    console.error("[RAG] Session creation error:", error);
    return null;
  }
}

// Save user message
async function saveUserMessage(baseUrl, sessionId, content, userId) {
  try {
    console.log("[RAG] Saving user message", {
      sessionId,
      contentLength: content.length,
    });

    const response = await fetch(`${baseUrl}/api/chat/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        role: "user",
        content,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[RAG] User message save failed", {
        status: response.status,
        error: errorText,
      });
      return;
    }

    const data = await response.json();
    console.log("[RAG] User message saved", { messageId: data.message?.id });
    return data;
  } catch (error) {
    console.error("[RAG] Error saving user message:", error);
  }
}

// Process content for saving
function processContent(rawContent) {
  return rawContent
    .replace(/\\n/g, "\n")
    .replace(/\n\n/g, "<DOUBLE_NEWLINE>")
    .replace(/\n/g, "\n")
    .replace(/<DOUBLE_NEWLINE>/g, "\n\n");
}

// Extract text from stream chunks
function extractTextFromChunk(chunk) {
  if (chunk.includes('"text":')) {
    try {
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.trim() && line.includes('"text":')) {
          const jsonStart = line.indexOf("{");
          if (jsonStart >= 0) {
            const jsonStr = line.substring(jsonStart);
            try {
              const parsedJson = JSON.parse(jsonStr);
              if (parsedJson.text) {
                return parsedJson.text;
              }
            } catch (e) {
              const textMatch = jsonStr.match(/"text":"([^"]+)"/);
              if (textMatch && textMatch[1]) {
                return textMatch[1];
              }
            }
          }
        }
      }
    } catch (e) {
      // Silently continue
    }
  } else if (chunk.includes('0:"')) {
    const textParts = chunk.match(/\d+:"([^"]*)"/g);
    if (textParts) {
      return textParts
        .map((part) => {
          const match = part.match(/\d+:"([^"]*)"/);
          return match ? match[1] : "";
        })
        .join("");
    }
  }
  return "";
}

function getSessionTitle(messages) {
  return messages.length > 0 && messages[0].role === "user"
    ? messages[0].content.substring(0, 50) +
        (messages[0].content.length > 50 ? "..." : "")
    : "New Chat";
}

function createSystemPrompt(contextString, userQuery) {
  return `You are an AI assistant with retrieved context:
${contextString}
User query: ${userQuery || "(not provided)"}
Use only the above context to answer. If unsure, say so. 
You may also suggest workflows that involve combining multiple models, papers, or methods to help the user solve a problem.
Keep responses concise. Ask for clarification if needed. Link to urls in AImodels.fyi rather than to external sites like arxiv, huggingface, or replicate.
Always render example images or thumbnails in your response as markdown when relevant if they're available. Never return markdown headings.`;
}

function formatRagContext(ragContext) {
  if (!ragContext) return "No extra context provided.";

  let docArray = [];
  if (Array.isArray(ragContext)) {
    docArray = ragContext;
  } else {
    const { models = [], papers = [] } = ragContext;
    docArray = [...models, ...papers];
  }

  if (docArray.length === 0) return "No extra context provided.";

  return docArray
    .map((doc, i) => {
      if (doc.modelName) {
        const modelURL = `https://aimodels.fyi/models/${
          doc.platform || "unknown"
        }/${doc.slug || "N/A"}`;
        return `Result ${i + 1}:
Model Name: ${doc.modelName || "Unknown"}
Example image: ${doc.example || "No example provided"}
Creator: ${doc.creator || "Unknown"}
Description: ${doc.description || "No description."}
Tags: ${doc.tags || "None"}
Score: ${doc.totalScore || "N/A"}
Last Updated: ${doc.lastUpdated || "N/A"}
URL: ${modelURL}`;
      } else if (doc.title) {
        const authors = Array.isArray(doc.authors)
          ? doc.authors.join(", ")
          : doc.authors || "Unknown";
        const paperURL = `https://aimodels.fyi/papers/${
          doc.platform || "unknown"
        }/${doc.slug || "N/A"}`;
        return `Result ${i + 1}:
Title: ${doc.title || "Untitled"}
Example image: ${doc.thumbnail || "No example image provided."}
Authors: ${authors}
Abstract: ${doc.abstract || "No abstract."}
Score: ${doc.totalScore || "N/A"}
Published Date: ${doc.publishedDate || "N/A"}
URL: ${paperURL}`;
      } else {
        return `Result ${i + 1}: Unknown doc type`;
      }
    })
    .join("\n\n");
}
