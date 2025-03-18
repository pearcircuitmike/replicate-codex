import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const bodyString = await req.text();
    const parsed = JSON.parse(bodyString);
    const { messages = [], userId, userQuery, ragContext, sessionId } = parsed;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const contextString = formatRagContext(ragContext);
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Get or create session
    const activeSessionId = await getOrCreateSession(
      baseUrl,
      sessionId,
      userId,
      messages
    );
    if (!activeSessionId) {
      return new Response("Failed to create or validate session", {
        status: 500,
      });
    }

    // Save user message
    const latestUserMessage = messages[messages.length - 1];
    if (latestUserMessage?.role === "user") {
      await saveUserMessage(
        baseUrl,
        activeSessionId,
        latestUserMessage.content,
        userId
      );
    }

    // Prepare system prompt and messages
    const systemPrompt = createSystemPrompt(contextString, userQuery);
    const messagesToSend = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Create a ReadableStream to handle the OpenAI response
    const { stream, controller } = createResponseStream();

    // Process the AI response using a TransformStream
    const ai = streamText({
      model: openai("gpt-4o-mini"),
      messages: messagesToSend,
    });

    // Set up content accumulation and response handling
    processAIResponse(
      ai,
      controller,
      baseUrl,
      activeSessionId,
      userId,
      ragContext
    );

    // Return streaming response
    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "X-Session-Id": activeSessionId,
    });

    return new Response(stream, { headers });
  } catch (error) {
    console.error("[RAG] Fatal error:", error);
    return new Response(`Failed to process chat request: ${error.message}`, {
      status: 500,
    });
  }
}

// Creates a ReadableStream for the response
function createResponseStream() {
  const encoder = new TextEncoder();
  let controller;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
  });

  return { stream, controller };
}

// Process the AI response, collect content, and save assistant message
async function processAIResponse(
  aiStream,
  controller,
  baseUrl,
  sessionId,
  userId,
  ragContext
) {
  const encoder = new TextEncoder();
  const textDecoder = new TextDecoder();
  let accumulatedContent = "";

  try {
    const response = aiStream.toDataStreamResponse();
    const reader = response.body.getReader();

    // Process stream until complete
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Stream complete - finalize
        controller.close();
        break;
      }

      // Forward the chunk to the client
      controller.enqueue(value);

      // Extract and accumulate text
      const chunk = textDecoder.decode(value, { stream: true });
      const extractedText = extractTextFromChunk(chunk);
      if (extractedText) {
        accumulatedContent += extractedText;
      }
    }

    // Save the complete assistant response
    if (accumulatedContent) {
      await saveAssistantResponse(
        baseUrl,
        sessionId,
        userId,
        accumulatedContent,
        ragContext
      );
    }
  } catch (error) {
    console.error("[RAG] Stream processing error:", error);
    controller.error(error);

    // If we've accumulated content, try to save what we have
    if (accumulatedContent) {
      try {
        await saveAssistantResponse(
          baseUrl,
          sessionId,
          userId,
          accumulatedContent,
          ragContext
        );
      } catch (saveError) {
        console.error(
          "[RAG] Failed to save partial assistant response:",
          saveError
        );
      }
    }
  }
}

// Get existing session or create a new one
async function getOrCreateSession(baseUrl, sessionId, userId, messages) {
  if (sessionId) return sessionId;

  try {
    const newSessionTitle = getSessionTitle(messages);
    const response = await fetch(`${baseUrl}/api/chat/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        title: newSessionTitle,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create session: ${response.status} ${errorText}`
      );
    }

    const sessionData = await response.json();
    return sessionData.session.id;
  } catch (error) {
    console.error("[RAG] Session creation error:", error);
    return null;
  }
}

// Save user message to database
async function saveUserMessage(baseUrl, sessionId, content, userId) {
  try {
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
      throw new Error(
        `Failed to save user message: ${response.status} ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("[RAG] Error saving user message:", error);
    throw error;
  }
}

// Save assistant response to database
async function saveAssistantResponse(
  baseUrl,
  sessionId,
  userId,
  rawContent,
  ragContext
) {
  if (!rawContent || rawContent.length === 0) {
    throw new Error("[RAG] Empty content, cannot save assistant response");
  }

  // Process the content
  const content = rawContent
    .replace(/\\n/g, "\n")
    .replace(/\n\n/g, "<DOUBLE_NEWLINE>")
    .replace(/\n/g, "\n")
    .replace(/<DOUBLE_NEWLINE>/g, "\n\n");

  try {
    const response = await fetch(`${baseUrl}/api/chat/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        role: "assistant",
        content,
        user_id: userId,
        rag_context: ragContext || null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to save assistant message: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    console.info(
      `[RAG] Successfully saved assistant message with ID: ${
        data.message?.id || "unknown"
      }`
    );
    return data;
  } catch (error) {
    console.error("[RAG] Error saving assistant response:", error);
    throw error;
  }
}

// Extract text content from AI stream chunks
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
