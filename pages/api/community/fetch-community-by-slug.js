import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;
  if (!slug) {
    return res.status(400).json({ error: "Missing slug parameter" });
  }

  try {
    // 1) Attempt to fetch the community row by slug
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
      .eq("slug", slug)
      .single(); // single() ensures we only want one row

    if (error || !data) {
      // If no matching row or an error from Supabase
      console.error("Supabase error:", error);
      return res.status(404).json({ error: "Community not found by slug" });
    }

    // 2) Return the row
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching community by slug:", err);
    return res.status(500).json({ error: err.message });
  }
}
