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

    // Check if bookmark already exists
    const { data: existingBookmark, error: checkError } = await supabase
      .from("bookmarks")
      .select()
      .eq("user_id", user.id)
      .eq("bookmarked_resource", resourceId)
      .eq("resource_type", resourceType)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existingBookmark) {
      return res
        .status(200)
        .json({
          message: "Bookmark already exists",
          bookmark: existingBookmark,
        });
    }

    // If no existing bookmark, proceed with insertion
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
