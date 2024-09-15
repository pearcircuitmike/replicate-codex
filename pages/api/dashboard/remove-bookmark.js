// pages/api/dashboard/remove-bookmark.js
import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const { resourceId, resourceType } = req.body;

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("bookmarked_resource", resourceId)
      .eq("resource_type", resourceType);

    if (error) throw error;

    res.status(200).json({ message: "Bookmark removed successfully" });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    res
      .status(500)
      .json({ error: "An error occurred while removing the bookmark" });
  }
}
