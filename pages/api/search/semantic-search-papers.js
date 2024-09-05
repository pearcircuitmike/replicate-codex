import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const {
        embedding,
        similarityThreshold = 0.8,
        matchCount = 10,
      } = req.body;

      if (
        !embedding ||
        !Array.isArray(embedding) ||
        embedding.length !== 1536
      ) {
        return res.status(400).json({
          error: "Invalid embedding. Must be an array of 1536 numbers.",
        });
      }

      console.log("Received embedding:", embedding.slice(0, 5));
      console.log("Similarity threshold:", similarityThreshold);
      console.log("Match count:", matchCount);

      const { data, error } = await supabase.rpc("search_papers", {
        query_embedding: embedding,
        similarity_threshold: similarityThreshold,
        match_count: matchCount,
      });

      if (error) {
        console.error("Error in search_papers RPC:", error);
        throw error;
      }

      console.log("Search results:", data ? data.length : "No data");

      return res.status(200).json({ data });
    } catch (error) {
      console.error("Error in semantic search:", error);
      return res.status(500).json({
        error: "An error occurred during the search",
        details: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
