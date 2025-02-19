// pages/api/dashboard/highlights.js

import supabase from "@/pages/api/utils/supabaseClient";

export default async function handler(req, res) {
  // Only handle GET requests here
  if (req.method === "GET") {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      // IMPORTANT: Use exact aliases matching what the front-end expects
      // userProfile: ... => highlight.userProfile
      // arxivPapersData: ... => highlight.arxivPapersData
      const { data, error } = await supabase
        .from("highlights")
        .select(
          `
          id,
          quote,
          prefix,
          suffix,
          text_position,
          context_snippet,
          created_at,
          paper_id,
          user_id,

          userProfile:public_profile_info!highlights_user_id_fkey (
            id,
            full_name,
            avatar_url,
            username
          ),

          arxivPapersData:"arxivPapersData"!highlights_paper_id_fkey (
            slug,
            platform,
            title
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Return the highlights to the client
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching highlights:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  // If it's not a GET, return 405
  return res
    .status(405)
    .json({ error: `Method ${req.method} is not allowed.` });
}
