/**
 * RAG chat API with session storage
 */
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
    // Parse request body
    const bodyString = await req.text();
    const parsed = JSON.parse(bodyString);
    const { messages = [], userId, userQuery, ragContext, sessionId } = parsed;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Process models and papers for context
    let docArray = [];
    if (ragContext) {
      if (Array.isArray(ragContext)) {
        docArray = ragContext;
      } else {
        const { models = [], papers = [] } = ragContext;
        docArray = [...models, ...papers];
      }
    }

    // Create context string for the prompt
    const contextString =
      docArray.length > 0
        ? docArray
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
            .join("\n\n")
        : "No extra context provided.";

    // Get base URL from request
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Session management
    let activeSessionId = sessionId;
    let newSessionCreated = false;

    // Create new session if needed
    if (!activeSessionId) {
      const newSessionTitle =
        messages.length > 0 && messages[0].role === "user"
          ? messages[0].content.substring(0, 50) +
            (messages[0].content.length > 50 ? "..." : "")
          : "New Chat";

      try {
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
          newSessionCreated = true;
          console.log("[RAG] Created new session:", activeSessionId);
        }
      } catch (error) {
        console.error("[RAG] Failed to create session:", error);
      }
    } else {
      console.log("[RAG] Using existing session:", activeSessionId);
    }

    // Save user message if we have a session
    const latestUserMessage = messages[messages.length - 1];
    if (
      activeSessionId &&
      latestUserMessage &&
      latestUserMessage.role === "user"
    ) {
      try {
        console.log("[RAG] Saving user message to DB...");
        const userMsgResponse = await fetch(`${baseUrl}/api/chat/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: activeSessionId,
            role: "user",
            content: latestUserMessage.content,
            user_id: userId,
          }),
        });

        if (userMsgResponse.ok) {
          console.log("[RAG] User message saved successfully");
        } else {
          console.error(
            "[RAG] Failed to save user message:",
            await userMsgResponse.text()
          );
        }
      } catch (error) {
        console.error("[RAG] Error saving user message:", error);
      }
    }

    // Create system prompt
    const systemPrompt = `You are an AI assistant with retrieved context:
${contextString}
User query: ${userQuery || "(not provided)"}
Use only the above context to answer. If unsure, say so. 
You may also suggest workflows that involve combining multiple models, papers, or methods to help the user solve a problem.
Keep responses concise. Ask for clarification if needed. Link to urls in AImodels.fyi rather than to external sites like arxiv, huggingface, or replicate.
Always render example images or thumbnails in your response as markdown when relevant if they're available. Never return markdown headings.`;

    // Prepare messages for the model
    const messagesToSend = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    console.log("[RAG] Sending request to LLM...");
    // Using ai-sdk's streamText for streaming response
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: messagesToSend,
    });

    // Get the original response to forward to the client
    const originalResponse = result.toDataStreamResponse();

    // Create our own transformer to collect properly formatted content
    let fullTextContent = "";
    let textChunks = [];

    // Use a ReadableStream to process the chunks
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Process the chunks
    (async () => {
      try {
        // Get reader from original response
        const reader = originalResponse.body.getReader();
        const textDecoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Forward the chunk to the client
          await writer.write(value);

          // Parse the chunk to extract text content
          try {
            const chunk = textDecoder.decode(value, { stream: true });
            console.log("[RAG] Raw chunk:", chunk);

            // Pattern 1: JSON with text field
            if (chunk.includes('"text":')) {
              try {
                // Try to parse as JSON
                const lines = chunk.split("\n");
                for (const line of lines) {
                  if (line.trim() && line.includes('"text":')) {
                    // Extract just enough to get a valid JSON object with the text field
                    const jsonStart = line.indexOf("{");
                    if (jsonStart >= 0) {
                      const jsonStr = line.substring(jsonStart);
                      try {
                        const parsedJson = JSON.parse(jsonStr);
                        if (parsedJson.text) {
                          textChunks.push(parsedJson.text);
                        }
                      } catch (e) {
                        // If we can't parse the full JSON, try to extract with regex
                        const textMatch = jsonStr.match(/"text":"([^"]*)"/);
                        if (textMatch && textMatch[1]) {
                          textChunks.push(textMatch[1]);
                        }
                      }
                    }
                  }
                }
              } catch (e) {
                console.log("[RAG] JSON parsing error:", e.message);
              }
            }
            // Pattern 2: Numbered text chunks like 0:"text"
            else if (chunk.includes('0:"')) {
              const textParts = chunk.match(/0:"([^"]*)"/g);
              if (textParts) {
                for (const part of textParts) {
                  const text = part.substring(3, part.length - 1);
                  textChunks.push(text);
                }
              }
            }
          } catch (parseError) {
            console.error("[RAG] Error parsing chunk:", parseError);
          }
        }

        // End the stream
        await writer.close();

        // Join all text chunks with proper newline handling
        fullTextContent = textChunks.join("");

        // Process escaped newlines to actual newlines
        fullTextContent = fullTextContent
          .replace(/\\n/g, "\n") // Replace escaped newlines with actual newlines
          .replace(/\n\n/g, "<DOUBLE_NEWLINE>") // Temporarily mark double newlines
          .replace(/\n/g, "\n") // Ensure single newlines are preserved
          .replace(/<DOUBLE_NEWLINE>/g, "\n\n"); // Restore double newlines

        // Save the complete response to the database
        if (activeSessionId && fullTextContent.trim().length > 0) {
          console.log("[RAG] Stream complete, saving assistant response...");
          console.log(
            "[RAG] Extracted content length:",
            fullTextContent.length
          );
          console.log(
            "[RAG] First 100 chars of content:",
            fullTextContent.substring(0, 100)
          );
          console.log("[RAG] Full content:", fullTextContent);

          try {
            const saveResponse = await fetch(`${baseUrl}/api/chat/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                session_id: activeSessionId,
                role: "assistant",
                content: fullTextContent,
                user_id: userId,
                rag_context: ragContext || null,
              }),
            });

            if (saveResponse.ok) {
              console.log(
                "[RAG] Successfully saved formatted assistant response:",
                saveResponse.status
              );
            } else {
              console.error(
                "[RAG] Failed to save assistant response:",
                saveResponse.status,
                await saveResponse.text()
              );
            }
          } catch (error) {
            console.error("[RAG] Error saving assistant response:", error);
          }
        } else {
          console.warn(
            "[RAG] Not saving response - missing session ID or empty content"
          );
        }
      } catch (error) {
        console.error("[RAG] Stream processing error:", error);
        await writer.abort(error);
      }
    })();

    // Create headers for the response
    const headers = new Headers(originalResponse.headers);

    // Add session ID to the headers
    if (activeSessionId) {
      headers.set("X-Session-Id", activeSessionId);
    }

    // Return the response with our readable stream
    return new Response(readable, {
      status: originalResponse.status,
      statusText: originalResponse.statusText,
      headers,
    });
  } catch (error) {
    console.error("[RAG] Fatal error:", error);
    return new Response(`Failed to process chat request: ${error.message}`, {
      status: 500,
    });
  }
}
