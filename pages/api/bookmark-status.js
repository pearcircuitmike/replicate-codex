import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const { userId, resourceId, resourceType } = req.query;

    if (!userId || !resourceId || !resourceType) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId)
        .eq("bookmarked_resource", resourceId)
        .eq("resource_type", resourceType)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return res.status(200).json({ isBookmarked: !!data });
    } catch (error) {
      console.error("Error checking bookmark status:", error);
      return res.status(500).json({ error: "Error checking bookmark status" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
