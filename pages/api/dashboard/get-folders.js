// pages/api/dashboard/get-folders.js
import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    const { data: folders, error: folderError } = await supabase
      .from("folders")
      .select(
        `
        *,
        bookmarks:bookmarks(count)
      `
      )
      .eq("user_id", user.id)
      .order("position", { ascending: true });

    if (folderError) throw folderError;

    const foldersWithCount = folders.map((folder) => ({
      ...folder,
      bookmarkCount: folder.bookmarks[0].count,
    }));

    res.status(200).json({ folders: foldersWithCount });
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ error: "An error occurred while fetching folders" });
  }
}
