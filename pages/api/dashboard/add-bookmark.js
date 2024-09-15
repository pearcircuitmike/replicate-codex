// pages/api/dashboard/add-bookmark.js
import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const { resourceId, resourceType, folderId, title } = req.body;

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
      .insert({
        user_id: user.id,
        bookmarked_resource: resourceId,
        resource_type: resourceType,
        folder_id: folderId,
        title: title,
      })
      .select()
      .single();

    if (error) throw error;

    res
      .status(201)
      .json({ message: "Bookmark added successfully", bookmark: data });
  } catch (error) {
    console.error("Error adding bookmark:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the bookmark" });
  }
}
