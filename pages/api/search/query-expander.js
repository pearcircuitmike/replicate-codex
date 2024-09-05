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
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that expands search queries into related terms. Provide a comma-separated list of related terms, including the original query.",
          },
          {
            role: "user",
            content: `Expand the following search query into related terms: ${query}`,
          },
        ],
        max_tokens: 150,
        n: 1,
        temperature: 0.7,
      });

      const expandedQuery = completion.data.choices[0].message.content.trim();
      const relatedTerms = expandedQuery.split(",").map((term) => term.trim());

      return res.status(200).json({ expandedQuery: relatedTerms });
    } catch (error) {
      console.error("Error in query expansion:", error);
      return res
        .status(500)
        .json({ error: "An error occurred during query expansion" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
