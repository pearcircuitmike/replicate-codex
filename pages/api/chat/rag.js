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
    let activeSessionId = sessionId;

    if (!activeSessionId) {
      try {
        const newSessionTitle = getSessionTitle(messages);
        const sessionRes = await fetch(`${baseUrl}/api/chat/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            title: newSessionTitle,
          }),
        });

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          activeSessionId = sessionData.session.id;
        }
      } catch (error) {
        console.error("[RAG] Failed to create session:", error);
      }
    }

    // Save user message
    const latestUserMessage = messages[messages.length - 1];
    if (activeSessionId && latestUserMessage?.role === "user") {
      await saveUserMessage(
        baseUrl,
        activeSessionId,
        latestUserMessage.content,
        userId
      );
    }

    const systemPrompt = createSystemPrompt(contextString, userQuery);
    const messagesToSend = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Using ai-sdk's streamText for streaming response
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: messagesToSend,
    });

    // Store content in a reference object to persist across async boundaries
    const contentStore = {
      text: "",
      done: false,
    };

    // Set up response pipeline
    const { streamResponse } = setupResponsePipeline(result, contentStore);

    // Save assistant response when streaming completes
    if (activeSessionId) {
      saveAssistantResponseWhenDone(
        baseUrl,
        activeSessionId,
        userId,
        contentStore,
        ragContext
      );
    }

    const headers = new Headers();
    headers.set("Content-Type", "text/event-stream");

    if (activeSessionId) {
      headers.set("X-Session-Id", activeSessionId);
    }

    return new Response(streamResponse, { headers });
  } catch (error) {
    console.error("[RAG] Fatal error:", error);
    return new Response(`Failed to process chat request: ${error.message}`, {
      status: 500,
    });
  }
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

function getSessionTitle(messages) {
  return messages.length > 0 && messages[0].role === "user"
    ? messages[0].content.substring(0, 50) +
        (messages[0].content.length > 50 ? "..." : "")
    : "New Chat";
}

async function saveUserMessage(baseUrl, sessionId, content, userId) {
  try {
    await fetch(`${baseUrl}/api/chat/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        role: "user",
        content,
        user_id: userId,
      }),
    });
  } catch (error) {
    console.error("[RAG] Error saving user message:", error);
  }
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

function setupResponsePipeline(result, contentStore) {
  const originalResponse = result.toDataStreamResponse();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  (async () => {
    try {
      const reader = originalResponse.body.getReader();
      const textDecoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          contentStore.done = true;
          break;
        }

        await writer.write(value);
        const chunk = textDecoder.decode(value, { stream: true });

        try {
          const extractedText = extractTextFromChunk(chunk);
          if (extractedText) {
            contentStore.text += extractedText;
          }
        } catch (error) {
          console.error("[RAG] Error processing chunk:", error);
        }
      }

      await writer.close();
    } catch (error) {
      console.error("[RAG] Stream processing error:", error);
      await writer.abort(error);
    }
  })();

  return { streamResponse: readable };
}

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

async function saveAssistantResponseWhenDone(
  baseUrl,
  sessionId,
  userId,
  contentStore,
  ragContext
) {
  // Check for content completion every 500ms
  const checkInterval = setInterval(async () => {
    if (contentStore.done) {
      clearInterval(checkInterval);

      try {
        // Get content from reference object
        const rawContent = contentStore.text;

        if (!rawContent || rawContent.length === 0) {
          console.error(
            "[RAG] Error: Empty content, cannot save assistant response"
          );
          return;
        }

        // Process the content
        let content = rawContent
          .replace(/\\n/g, "\n")
          .replace(/\n\n/g, "<DOUBLE_NEWLINE>")
          .replace(/\n/g, "\n")
          .replace(/<DOUBLE_NEWLINE>/g, "\n\n");

        await fetch(`${baseUrl}/api/chat/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            role: "assistant",
            content,
            user_id: userId,
            rag_context: ragContext || null,
          }),
        });
      } catch (error) {
        console.error("[RAG] Error saving assistant response:", error);
      }
    }
  }, 500);

  // Safety timeout after 10 seconds
  setTimeout(() => {
    clearInterval(checkInterval);

    // Force one last attempt if not done
    if (!contentStore.done && contentStore.text) {
      saveAssistantContent(
        baseUrl,
        sessionId,
        userId,
        contentStore.text,
        ragContext
      );
    }
  }, 10000);
}

// Helper function to save content
async function saveAssistantContent(
  baseUrl,
  sessionId,
  userId,
  rawContent,
  ragContext
) {
  try {
    if (!rawContent || rawContent.length === 0) {
      return;
    }

    let content = rawContent
      .replace(/\\n/g, "\n")
      .replace(/\n\n/g, "<DOUBLE_NEWLINE>")
      .replace(/\n/g, "\n")
      .replace(/<DOUBLE_NEWLINE>/g, "\n\n");

    await fetch(`${baseUrl}/api/chat/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        role: "assistant",
        content,
        user_id: userId,
        rag_context: ragContext || null,
      }),
    });
  } catch (error) {
    console.error("[RAG] Error in saveAssistantContent:", error);
  }
}
