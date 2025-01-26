/**
 * Minimal logs to confirm we get ragContext.
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
    // In edge runtime, we read as text then parse
    const bodyString = await req.text();
    console.log("Received /api/chat/rag body:", bodyString);
    const { messages, ragContext = [], userId } = JSON.parse(bodyString);

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Convert the array of docs to a single string
    const contextString =
      ragContext.length > 0
        ? ragContext
            .map((doc, i) => {
              return `Result ${i + 1}:
Model Name: ${doc.modelName}
Description: ${doc.description}
Example: ${doc.example}`;
            })
            .join("\n\n")
        : "No extra context provided.";

    console.log("RAG context string:\n", contextString);

    // Combine into a system prompt
    const messagesToSend = [
      {
        role: "system",
        content: `You are an AI assistant with the following retrieved context:

${contextString}

Use only the above context to answer. If unsure, say so. Keep responses concise. Ask for clarification if needed, or prompt the user for more nuance/info.`,
      },
      ...messages,
    ];

    // Call your LLM with streaming
    const result = streamText({
      model: openai("gpt-4o-mini"), // Or your desired model
      messages: messagesToSend,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("RAG Chat Error:", error);
    return new Response("Failed to process chat request", { status: 500 });
  }
}
