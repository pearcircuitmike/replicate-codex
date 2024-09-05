// pages/api/search/create-embedding.js
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: query,
      });

      const [{ embedding }] = embeddingResponse.data.data;

      return res.status(200).json({ embedding });
    } catch (error) {
      console.error("Error creating embedding:", error);
      return res
        .status(500)
        .json({
          error: "An error occurred while creating the embedding",
          details: error.message,
        });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
