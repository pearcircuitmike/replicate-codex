// pages/api/utils/fetchRelatedModels.js

import supabase from "./supabaseClient";

export default async function handler(req, res) {
  try {
    const { embedding, similarityThreshold = 0.75, matchCount = 5 } = req.body;

    if (!embedding) {
      return res.status(400).json({ error: "No embedding provided" });
    }

    const { data: relatedModels, error } = await supabase.rpc("search_models", {
      query_embedding: embedding,
      similarity_threshold: similarityThreshold,
      match_count: matchCount,
      time_range_start: new Date("1970-01-01T00:00:00Z"),
    });

    if (error) {
      console.error("Error fetching related models:", error);
      return res.status(500).json({ error: "Failed to fetch related models" });
    }

    return res.status(200).json({ relatedModels });
  } catch (error) {
    console.error("Server error in fetchRelatedModels route:", error);
    return res
      .status(500)
      .json({ error: "Server error while fetching related models" });
  }
}
