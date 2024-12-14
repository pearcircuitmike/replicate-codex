// pages/api/chat/paper.js
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
    const { messages, paperContext, userId } = await req.json();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Combine the paper context with the incoming messages
    const messagesToSend = [
      {
        role: "system",
        content: `You are an AI research assistant helping to explain this paper. Here is the context:

Abstract: ${paperContext.abstract}

Summary: ${paperContext.generatedSummary}

Answer questions about this paper based on the above context. If you're unsure about something, admit that you don't know rather than making assumptions. Keep responses clear and concise.`,
      },
      ...messages,
    ];

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: messagesToSend,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Failed to process chat request", { status: 500 });
  }
}
