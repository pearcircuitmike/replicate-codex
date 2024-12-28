// pages/api/utils/fetchRelatedPapers.js

import supabase from "./supabaseClient";

// This is your API route
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { embedding } = req.body;

    // If no embedding is provided in the request body, return 400
    if (!embedding) {
      return res.status(400).json({ error: "Missing embedding" });
    }

    // Call Supabase RPC (with just three arguments now).
    const { data: relatedPapers, error } = await supabase.rpc("search_papers", {
      query_embedding: embedding,
      similarity_threshold: 0.75,
      match_count: 5,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch related papers from Supabase." });
    }

    // Return an array of papers
    return res.status(200).json({ papers: relatedPapers || [] });
  } catch (err) {
    console.error("Unexpected error in fetchRelatedPapers route:", err);
    return res
      .status(500)
      .json({ error: "Internal server error while fetching related papers." });
  }
}
