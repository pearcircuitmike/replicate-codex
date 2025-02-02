/**
 * Minimal logs to confirm we get ragContext.
 * This is a Next.js Edge Route example.
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
    // 1) Read the entire request body as text (Edge style).
    const bodyString = await req.text();
    console.log("Received /api/chat/rag body:", bodyString);

    // 2) Parse the JSON. "ai/react" normally sends messages + any body we pass in.
    const parsed = JSON.parse(bodyString);
    // For debugging, log the entire parsed object
    console.log("Parsed body object:", JSON.stringify(parsed, null, 2));

    // 3) Extract data from the parsed object
    const { messages = [], userId, userQuery, ragContext } = parsed;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 4) Merge models + papers into one array
    let docArray = [];
    if (ragContext) {
      if (Array.isArray(ragContext)) {
        docArray = ragContext;
      } else {
        const { models = [], papers = [] } = ragContext;
        docArray = [...models, ...papers];
      }
    }

    // 5) Convert docArray to a string for the system prompt
    const contextString =
      docArray.length > 0
        ? docArray
            .map((doc, i) => {
              // If it's a model doc
              if (doc.modelName) {
                // Compute URL for a model doc.
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
                // If it's a paper doc
              } else if (doc.title) {
                const authors = Array.isArray(doc.authors)
                  ? doc.authors.join(", ")
                  : doc.authors || "Unknown";
                const categories = Array.isArray(doc.arxivCategories)
                  ? doc.arxivCategories.join(", ")
                  : doc.arxivCategories || "None";
                // Compute URL for a paper doc.
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
                // Fallback if neither
              } else {
                return `Result ${i + 1}:
Unknown doc type. Raw data: ${JSON.stringify(doc, null, 2)}`;
              }
            })
            .join("\n\n")
        : "No extra context provided.";

    console.log("RAG context string:\n", contextString);

    // 6) Build the system prompt
    const systemPrompt = `You are an AI assistant with retrieved context:

${contextString}

User query: ${userQuery || "(not provided)"}

Use only the above context to answer. If unsure, say so. 
You may also suggest workflows that involve combining multiple models, papers, or methods to help the user solve a problem.

Keep responses concise. Ask for clarification if needed. Link to urls in AImodels.fyi rather than to external sites like arxiv, huggingface, or replicate.
Always render example images or thumbnails in your response as markdown when relevant if they're available. Never return markdown headings. `;

    // 7) Our final messages to the model
    const messagesToSend = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // 8) Stream the final reply from OpenAI
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: messagesToSend,
    });

    // 9) Return the streaming response
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("RAG Chat Error:", error);
    return new Response("Failed to process chat request", { status: 500 });
  }
}
