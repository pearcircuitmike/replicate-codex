// /pages/api/highlights/manage-highlights.js
import supabase from "@/pages/api/utils/supabaseClient";

export default async function handler(req, res) {
  // For POST and DELETE, verify user_id is provided
  if ((req.method === "POST" || req.method === "DELETE") && !req.body.user_id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  switch (req.method) {
    case "GET":
      try {
        const { paper_id } = req.query;
        if (!paper_id) {
          return res.status(400).json({ error: "paper_id is required" });
        }

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
            user_profile:public_profile_info!highlights_user_id_fkey (
              id,
              full_name,
              avatar_url,
              username
            )
          `
          )
          .eq("paper_id", paper_id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return res.status(200).json(data.filter((hl) => hl && hl.id));
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

    case "POST":
      try {
        const {
          user_id,
          paper_id,
          quote,
          prefix,
          suffix,
          text_position,
          context_snippet,
        } = req.body;

        const highlight = {
          user_id,
          paper_id,
          quote,
          prefix,
          suffix,
          text_position,
          context_snippet,
        };

        const { data, error } = await supabase
          .from("highlights")
          .insert(highlight)
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
            user_profile:public_profile_info!highlights_user_id_fkey (
              id,
              full_name,
              avatar_url,
              username
            )
          `
          )
          .single();

        if (error) throw error;
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

    case "DELETE":
      try {
        const { highlight_id, user_id } = req.body;

        // First verify the highlight exists and belongs to the user
        const { data: highlight, error: fetchError } = await supabase
          .from("highlights")
          .select("id")
          .eq("id", highlight_id)
          .eq("user_id", user_id)
          .single();

        if (fetchError || !highlight) {
          return res
            .status(403)
            .json({ error: "Not authorized to delete this highlight" });
        }

        const { error } = await supabase
          .from("highlights")
          .delete()
          .eq("id", highlight_id)
          .eq("user_id", user_id);

        if (error) throw error;
        return res.status(200).json({ success: true });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      return res
        .status(405)
        .json({ error: `Method ${req.method} Not Allowed` });
  }
}
