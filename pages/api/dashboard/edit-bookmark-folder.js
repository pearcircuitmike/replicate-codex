// pages/api/dashboard/edit-bookmark-folder.js
import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const { folderId, name, color } = req.body;

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { data, error } = await supabase
      .from("folders")
      .update({ name: name.trim(), color })
      .eq("id", folderId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    res
      .status(200)
      .json({ message: "Folder updated successfully", folder: data });
  } catch (error) {
    console.error("Error updating folder:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the folder" });
  }
}
