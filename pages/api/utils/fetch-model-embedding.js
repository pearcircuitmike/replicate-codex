// pages/api/utils/fetch-model-embedding.js
import supabase from "./supabaseClient";

export default async function handler(req, res) {
  try {
    // If your Next.js config automatically parses JSON,
    // then req.body is an object (no need to JSON.parse).
    const { slug, platform } = req.body;

    // Make sure we have what we need
    if (!slug || !platform) {
      return res.status(400).json({ error: "Missing slug or platform" });
    }

    // Query only the "embedding" field from the "modelsData" table
    const { data, error } = await supabase
      .from("modelsData")
      .select("embedding")
      .eq("slug", slug)
      .eq("platform", platform)
      .single();

    if (error) {
      console.error("Error fetching embedding from DB:", error);
      return res.status(500).json({ error: "Failed to fetch embedding" });
    }

    if (!data || !data.embedding) {
      return res
        .status(404)
        .json({ error: "No embedding found for this model" });
    }

    // Return the embedding to the client
    return res.status(200).json({ embedding: data.embedding });
  } catch (error) {
    console.error("Server error fetching model embedding:", error);
    return res.status(500).json({ error: "Server error fetching embedding" });
  }
}
