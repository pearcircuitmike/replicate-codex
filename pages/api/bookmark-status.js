import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { user, error } = await supabase.auth.api.getUserByCookie(req);
  if (error || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const { resourceId, resourceType } = req.query;

    if (!resourceId || !resourceType) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*, folders(*)")
        .eq("user_id", user.id)
        .eq("bookmarked_resource", resourceId)
        .eq("resource_type", resourceType)
        .maybeSingle(); // Use maybeSingle to handle no bookmark case gracefully

      if (error) {
        throw error;
      }

      return res.status(200).json({
        isBookmarked: !!data,
        folder: data ? data.folders : null,
      });
    } catch (error) {
      console.error("Error checking bookmark status:", error);
      return res.status(500).json({ error: "Error checking bookmark status" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
