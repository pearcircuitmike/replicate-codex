import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const config = {
  runtime: "edge",
};

// Configuration
const CONFIG = {
  timeouts: {
    aiModel: 25000, // 25 seconds for AI model response
    apiRequests: 5000, // 5 seconds for internal API requests
    backgroundProcess: 28000, // 28 seconds total (under Vercel's 30s limit)
  },
  limits: {
    maxMessageLength: 32000, // Max character length for messages
    maxContextSize: 50, // Max number of context items
  },
};

export default async function handler(req, context) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Parse and validate request
    const bodyString = await req.text();
    if (!bodyString || bodyString.length > 1024 * 1024) {
      // 1MB limit
      return new Response("Request body too large", { status: 413 });
    }

    const parsed = validateAndSanitizeInput(bodyString);
    if (!parsed) {
      return new Response("Invalid request format", { status: 400 });
    }

    const { messages = [], userId, userQuery, ragContext, sessionId } = parsed;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Get or create session
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      activeSessionId = await createSession(baseUrl, messages, userId);
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

    // Prepare context and messages
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

    // Setup background processing with timeout
    const processingPromise = processStreamAndSaveResponse(
      messagesToSend,
      writer,
      baseUrl,
      activeSessionId,
      userId,
      ragContext
    );

    // Use platform-specific background processing
    if (context && typeof context.waitUntil === "function") {
      // Add timeout to the background process
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Background processing timeout"));
        }, CONFIG.timeouts.backgroundProcess);
      });

      // Race the processing against the timeout
      context.waitUntil(Promise.race([processingPromise, timeoutPromise]));
    } else {
      // Fallback approach with timeout
      setTimeout(() => {
        // Force close writer if still open after timeout
        try {
          writer.close().catch(() => {});
        } catch {
          // Ignore errors
        }
      }, CONFIG.timeouts.backgroundProcess);

      // Ensure promise doesn't get garbage collected
      processingPromise.catch(() => {});
    }

    return new Response(readable, { headers });
  } catch (error) {
    return new Response(`Failed to process chat request: ${error.message}`, {
      status: 500,
    });
  }
}

// Validate and sanitize input
function validateAndSanitizeInput(bodyString) {
  try {
    // Try to parse JSON
    const parsed = JSON.parse(bodyString);

    // Check required fields
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    // Validate and sanitize userId
    if (
      !parsed.userId ||
      typeof parsed.userId !== "string" ||
      parsed.userId.length > 100
    ) {
      return null;
    }

    // Validate and clean messages
    if (!Array.isArray(parsed.messages)) {
      parsed.messages = [];
    } else {
      // Sanitize messages
      parsed.messages = parsed.messages
        .filter(
          (msg) =>
            msg &&
            typeof msg === "object" &&
            typeof msg.role === "string" &&
            typeof msg.content === "string" &&
            (msg.role === "user" || msg.role === "assistant") &&
            msg.content.length <= CONFIG.limits.maxMessageLength
        )
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Limit total number of messages
      if (parsed.messages.length > 100) {
        parsed.messages = parsed.messages.slice(-100);
      }
    }

    // Sanitize optional userQuery
    if (parsed.userQuery && typeof parsed.userQuery === "string") {
      if (parsed.userQuery.length > CONFIG.limits.maxMessageLength) {
        parsed.userQuery = parsed.userQuery.substring(
          0,
          CONFIG.limits.maxMessageLength
        );
      }
    } else {
      parsed.userQuery = "";
    }

    // Validate sessionId if present
    if (parsed.sessionId) {
      if (
        typeof parsed.sessionId !== "string" ||
        parsed.sessionId.length > 100
      ) {
        parsed.sessionId = null;
      }
    }

    // Sanitize RAG context
    if (parsed.ragContext) {
      if (Array.isArray(parsed.ragContext)) {
        // Limit array size
        if (parsed.ragContext.length > CONFIG.limits.maxContextSize) {
          parsed.ragContext = parsed.ragContext.slice(
            0,
            CONFIG.limits.maxContextSize
          );
        }
      } else if (typeof parsed.ragContext === "object") {
        // Handle object with models and papers
        const models = Array.isArray(parsed.ragContext.models)
          ? parsed.ragContext.models.slice(0, CONFIG.limits.maxContextSize / 2)
          : [];

        const papers = Array.isArray(parsed.ragContext.papers)
          ? parsed.ragContext.papers.slice(0, CONFIG.limits.maxContextSize / 2)
          : [];

        parsed.ragContext = { models, papers };
      } else {
        // Invalid type, reset to empty
        parsed.ragContext = null;
      }
    }

    return parsed;
  } catch {
    return null;
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
  let fullContent = "";
  let aiResponseClosed = false;

  try {
    // Set up AI model timeout
    const modelTimeout = setTimeout(() => {
      if (!aiResponseClosed) {
        aiResponseClosed = true;
        try {
          writer.close().catch(() => {});
        } catch {
          // Ignore errors
        }
      }
    }, CONFIG.timeouts.aiModel);

    // Generate AI response with timeout
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages,
      options: {
        timeout: CONFIG.timeouts.aiModel,
      },
    });

    // Process the response stream
    const response = result.toDataStreamResponse();
    const reader = response.body.getReader();
    const textDecoder = new TextDecoder();

    // Read and process all chunks
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        aiResponseClosed = true;
        clearTimeout(modelTimeout);
        break;
      }

      // Forward to client
      await writer.write(value);

      // Extract text
      const chunk = textDecoder.decode(value, { stream: true });
      const extractedText = extractTextFromChunk(chunk);
      if (extractedText) {
        fullContent += extractedText;

        // Safety check for memory consumption
        if (fullContent.length > CONFIG.limits.maxMessageLength) {
          fullContent = fullContent.substring(
            0,
            CONFIG.limits.maxMessageLength
          );
          break;
        }
      }
    }

    // Close the writer when done reading
    if (!aiResponseClosed) {
      clearTimeout(modelTimeout);
      await writer.close();
      aiResponseClosed = true;
    }

    // Save the complete content
    if (sessionId && fullContent) {
      // Process content before saving
      const processedContent = processContent(fullContent);

      // Save assistant response with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CONFIG.timeouts.apiRequests
      );

      try {
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
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!saveResponse.ok) {
          throw new Error(
            `Failed to save assistant message: ${saveResponse.status}`
          );
        }
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    }
  } catch (error) {
    // Ensure writer is closed on error
    if (!aiResponseClosed) {
      try {
        await writer.close();
      } catch {
        // Ignore error
      }
    }

    // Try one last save attempt if we have content
    if (sessionId && fullContent && fullContent.length > 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          CONFIG.timeouts.apiRequests
        );

        await fetch(`${baseUrl}/api/chat/messages`, {
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
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
      } catch {
        // Ignore error on final attempt
      }
    }
  }
}

// Create a new session with timeout
async function createSession(baseUrl, messages, userId) {
  try {
    const newSessionTitle = getSessionTitle(messages);

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      CONFIG.timeouts.apiRequests
    );

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
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!sessionRes.ok) {
      return null;
    }

    const sessionData = await sessionRes.json();
    return sessionData.session.id;
  } catch {
    return null;
  }
}

// Save user message with timeout
async function saveUserMessage(baseUrl, sessionId, content, userId) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      CONFIG.timeouts.apiRequests
    );

    await fetch(`${baseUrl}/api/chat/messages`, {
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
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
  } catch {
    // Ignore error
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
    } catch {
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
