// pages/api/dashboard/get-or-create-uncategorized-folder.js
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

    // Check if Uncategorized folder exists
    const { data: existingFolder, error: fetchError } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .eq("name", "Uncategorized")
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (existingFolder) {
      return res.status(200).json({ folder: existingFolder });
    }

    // Create Uncategorized folder if it doesn't exist
    const { data: newFolder, error: createError } = await supabase
      .from("folders")
      .insert({
        name: "Uncategorized",
        color: "#A0AEC0", // Default gray color
        user_id: user.id,
      })
      .select()
      .single();

    if (createError) throw createError;

    res.status(201).json({ folder: newFolder });
  } catch (error) {
    console.error("Error getting or creating Uncategorized folder:", error);
    res.status(500).json({
      error:
        "An error occurred while getting or creating the Uncategorized folder",
    });
  }
}
