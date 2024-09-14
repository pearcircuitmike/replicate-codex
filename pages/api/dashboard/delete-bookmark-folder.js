// pages/api/dashboard/delete-bookmark-folder.js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { folderId } = req.body;

  // Authenticate the user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

  if (authError || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Check if the folder belongs to the user
    const { data: folder, error: folderError } = await supabase
      .from("folders")
      .select("name")
      .eq("id", folderId)
      .eq("user_id", user.id)
      .single();

    if (folderError || !folder) {
      return res
        .status(404)
        .json({ error: "Folder not found or does not belong to the user" });
    }

    if (folder.name === "Uncategorized") {
      return res
        .status(400)
        .json({ error: "Cannot delete the Uncategorized folder" });
    }

    // Get the Uncategorized folder ID
    const { data: uncategorizedFolder, error: uncategorizedError } =
      await supabase
        .from("folders")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", "Uncategorized")
        .single();

    if (uncategorizedError || !uncategorizedFolder) {
      return res.status(404).json({ error: "Uncategorized folder not found" });
    }

    // Move bookmarks to Uncategorized
    const { error: updateError } = await supabase
      .from("bookmarks")
      .update({ folder_id: uncategorizedFolder.id })
      .eq("folder_id", folderId)
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    // Delete the folder
    const { error: deleteError } = await supabase
      .from("folders")
      .delete()
      .eq("id", folderId)
      .eq("user_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    res
      .status(200)
      .json({ message: "Folder deleted and bookmarks moved successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the folder" });
  }
}
