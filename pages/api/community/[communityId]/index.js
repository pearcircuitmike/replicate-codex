// pages/api/community/[communityId]/index.js
import supabase from "../../utils/supabaseClient";

export default async function handler(req, res) {
  const { communityId } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1) Fetch the community
    const { data, error } = await supabase
      .from("communities")
      .select(
        `
        *,
        community_tasks (
          task_id,
          tasks (
            id,
            task
          )
        )
      `
      )
      .eq("id", communityId)
      .single();

    if (error) {
      // If not found, supabase might throw a “PGRST116” or a single() error
      return res.status(404).json({ error: "Community not found." });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error in GET community detail:", err);
    return res.status(500).json({ error: err.message });
  }
}
