// pages/api/dashboard/check-bookmark-status.js
import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { resourceId, resourceType } = req.query;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("bookmarked_resource", resourceId)
      .eq("resource_type", resourceType);

    if (error) throw error;

    const isBookmarked = data.length > 0;

    res.status(200).json({ isBookmarked });
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    res
      .status(500)
      .json({ error: "An error occurred while checking bookmark status" });
  }
}
