import { Configuration, OpenAIApi } from "openai";
import supabase from "./utils/supabaseClient";

const openAi = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: "Query is required" });
  }

  try {
    const prompt = `the user's query will be sent to you to generate an answer, and then use the answer for semantic search to find an AI model that can produce the solution to the problem or idea or use case the user is describing. Example: The user's query: 3D or point-cloud shapes or models The answer for use in semantic search:3D shapes or models are representations of objects in three-dimensional space. They can be created using various methods, including polygonal modeling, parametric modeling, and sculpting. Point cloud models, on the other hand, are collections of data points representing the external surface of an object or environment. These points are typically acquired through techniques like LiDAR scanning or photogrammetry. Point cloud models are useful for tasks such as 3D reconstruction, object recognition, and environmental mapping. Now respond similarly: The user's query: ${query}. The expanded query for use in semantic search:`;

    const gptResponse = await openAi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const generatedResponse = gptResponse.data.choices[0].message.content;

    const embeddingResponse = await openAi.createEmbedding({
      model: "text-embedding-ada-002",
      input: generatedResponse,
    });

    const embedding = embeddingResponse.data.data[0].embedding;

    const { data: modelsData, error } = await supabase.rpc("search_models", {
      query_embedding: embedding,
      similarity_threshold: 0.75,
      match_count: 10,
    });

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ data: modelsData });
  } catch (error) {
    console.error("Error processing request:", error);
    res
      .status(500)
      .json({ message: "An error occurred while processing your request" });
  }
}
