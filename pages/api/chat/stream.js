import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import supabase from "@/pages/api/utils/supabaseClient";
import { formatRagContext, createSystemPrompt } from "@/lib/context";
import { getRelevantContext } from "@/lib/retriever";

// Configuration
const CONFIG = {
  limits: {
    maxContextSize: 10, // Max number of context items to include (models + papers)
  },
};

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Parse request
    const {
      messages = [],
      userId,
      sessionId = null,
      model = "gpt-4o-mini",
      ragEnabled = true,
    } = await req.json();

    if (!userId || !messages.length) {
      return new Response("Missing user ID or messages", { status: 400 });
    }

    const userMessage = messages[messages.length - 1];
    if (userMessage.role !== "user") {
      return new Response("Last message must be from the user", {
        status: 400,
      });
    }

    // Get or create session
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      activeSessionId = await createSession(messages, userId);
    }

    // Save user message
    if (activeSessionId) {
      await saveUserMessage(activeSessionId, userMessage.content);
    }

    // Retrieve relevant context if RAG is enabled
    let ragContext = null;
    if (ragEnabled) {
      try {
        ragContext = await getRelevantContext(
          userMessage.content,
          CONFIG.limits.maxContextSize
        );
      } catch (error) {
        console.error("Error retrieving context:", error);
        // Continue without context if retrieval fails
        ragContext = { papers: [], models: [] };
      }
    }

    // Prepare system prompt with context
    const contextString = formatRagContext(ragContext);
    const systemPrompt = createSystemPrompt(contextString, userMessage.content);

    // Prepare messages for AI
    const messagesToSend = [
      { role: "system", content: systemPrompt },
      ...messages.slice(0, -1), // Previous messages
      userMessage, // Latest user message
    ];

    // Get AI stream directly
    const result = streamText({
      model: openai(model),
      messages: messagesToSend,
    });

    // Get the response directly from the AI SDK
    const response = result.toDataStreamResponse();

    // Add session ID header if available
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-cache");
    if (activeSessionId) {
      headers.set("X-Session-Id", activeSessionId);
    }

    // Clone the response for background processing
    const clonedResponse = response.clone();

    // Process and save in the background without awaiting
    processAndSaveResponse(clonedResponse, activeSessionId, ragContext);

    // Return the stream directly to the client
    return new Response(response.body, {
      headers,
      status: response.status,
    });
  } catch (error) {
    console.error("Chat stream error:", error);
    return new Response(`Error processing request: ${error.message}`, {
      status: 500,
    });
  }
}

// Process and save complete response to database
async function processAndSaveResponse(response, sessionId, ragContext) {
  console.log("Processing response for session:", sessionId);
  let extractedContent = "";

  try {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // Read the entire stream
    let chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(decoder.decode(value, { stream: true }));
    }

    // Combine all chunks
    const rawContent = chunks.join("");

    // AI-SDK specific format parsing
    // Extract all "0:" prefixed text parts which contain the actual content
    const textRegex = /0:"([^"]*)"/g;
    let match;
    while ((match = textRegex.exec(rawContent)) !== null) {
      extractedContent += match[1];
    }

    console.log("Extracted content length:", extractedContent.length);
    console.log("Content preview:", extractedContent.substring(0, 100));

    // Save only if we have content and a session
    if (sessionId && extractedContent.length > 0) {
      try {
        const savedMessage = await saveMessage({
          session_id: sessionId,
          role: "assistant",
          content: extractedContent,
          rag_context: ragContext || null,
        });
        console.log("Message saved successfully with ID:", savedMessage?.id);
      } catch (error) {
        console.error("Failed to save assistant message:", error);
      }
    } else {
      console.warn(
        "Not saving: sessionId exists:",
        !!sessionId,
        "Content length:",
        extractedContent.length
      );
    }

    // Record analytics for RAG usage if context was provided
    if (
      ragContext &&
      (ragContext.papers?.length > 0 || ragContext.models?.length > 0)
    ) {
      try {
        const { data: sessionData } = await supabase
          .from("chat_sessions")
          .select("user_id")
          .eq("id", sessionId)
          .single();

        if (sessionData?.user_id) {
          await recordRagUsage(sessionData.user_id, sessionId);
        }
      } catch (error) {
        console.error("Failed to record analytics:", error);
      }
    }
  } catch (error) {
    console.error("Error processing response:", error);
  }
}

// Record RAG usage
async function recordRagUsage(userId, sessionId) {
  const { error } = await supabase.from("analytics_events").insert([
    {
      user_id: userId,
      session_id: sessionId,
      event_type: "ragchat",
      event_data: { session_id: sessionId },
    },
  ]);

  if (error) throw error;
  return true;
}

// Create a new session
async function createSession(messages, userId) {
  try {
    const title = getSessionTitle(messages);
    console.log("Creating new session with title:", title);

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

    if (error) throw error;
    console.log("Session created with ID:", data.id);
    return data.id;
  } catch (error) {
    console.error("Error creating session:", error);
    return null;
  }
}

// Save a message directly to Supabase
async function saveMessage(messageData) {
  try {
    console.log(
      `Saving ${messageData.role} message to session ${messageData.session_id}`
    );

    const { data, error } = await supabase
      .from("chat_messages")
      .insert([messageData])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    // Update session timestamp
    const { error: updateError } = await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", messageData.session_id);

    if (updateError) {
      console.error("Error updating session timestamp:", updateError);
    }

    return data[0];
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

// Save user message
async function saveUserMessage(sessionId, content) {
  try {
    return await saveMessage({
      session_id: sessionId,
      role: "user",
      content,
    });
  } catch (error) {
    console.error("Error saving user message:", error);
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
