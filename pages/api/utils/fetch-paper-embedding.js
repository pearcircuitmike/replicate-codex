// pages/api/utils/fetch-paper-embedding.js
import supabase from "./supabaseClient";

export default async function handler(req, res) {
  try {
    // Do NOT parse again if Next already parsed it
    const { slug, platform } = req.body;

    const { data, error } = await supabase
      .from(`${platform}PapersData`)
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
        .json({ error: "No embedding found for this paper" });
    }

    return res.status(200).json({ embedding: data.embedding });
  } catch (error) {
    console.error("Error parsing request or fetching embedding:", error);
    return res.status(500).json({ error: "Server error fetching embedding" });
  }
}
