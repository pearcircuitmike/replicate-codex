// pages/api/search/query-expander.js
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

      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that expands search queries to improve search results. Provide a list of related terms and phrases that could be relevant to the given query.",
          },
          {
            role: "user",
            content: `Expand the following search query: "${query}"`,
          },
        ],
        max_tokens: 150,
        n: 1,
        temperature: 0.7,
      });

      const expandedQuery = completion.data.choices[0].message.content
        .split("\n")
        .map((term) => term.trim())
        .filter((term) => term !== "");

      return res.status(200).json({ expandedQuery: [query, ...expandedQuery] });
    } catch (error) {
      console.error("Error in query expansion:", error);
      return res.status(500).json({
        error: "An error occurred during query expansion",
        details: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
