// pages/api/dashboard/create-bookmark-folder.js

import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const { name, color } = req.body;

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Check if a folder with the same name already exists
    const { data: existingFolder, error: fetchError } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .eq("name", name)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "No rows found"
      throw fetchError;
    }

    if (existingFolder) {
      return res
        .status(400)
        .json({ error: "Folder with this name already exists" });
    }

    // Create new folder
    const { data: newFolder, error: createError } = await supabase
      .from("folders")
      .insert({
        name: name.trim(),
        color,
        user_id: user.id,
      })
      .select()
      .single();

    if (createError) throw createError;

    res.status(201).json({ folder: newFolder });
  } catch (error) {
    console.error("Error creating folder:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the folder" });
  }
}
