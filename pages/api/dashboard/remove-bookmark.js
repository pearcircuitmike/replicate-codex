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

    // First, fetch the bookmark to get the folder_id
    const { data: bookmarkData, error: fetchError } = await supabase
      .from("bookmarks")
      .select("folder_id")
      .eq("user_id", user.id)
      .eq("bookmarked_resource", resourceId)
      .eq("resource_type", resourceType)
      .single();

    if (fetchError) {
      console.error("Error fetching bookmark:", fetchError);
      return res.status(404).json({ error: "Bookmark not found" });
    }

    const folderId = bookmarkData.folder_id;

    // Now delete the bookmark
    const { error: deleteError } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("bookmarked_resource", resourceId)
      .eq("resource_type", resourceType);

    if (deleteError) throw deleteError;

    res
      .status(200)
      .json({ message: "Bookmark removed successfully", folderId });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    res
      .status(500)
      .json({ error: "An error occurred while removing the bookmark" });
  }
}
