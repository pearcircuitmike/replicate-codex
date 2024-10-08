// pages/api/folders.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { user, error } = await supabase.auth.api.getUserByCookie(req);
  if (error || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      return getFolders(user.id, res);
    case "POST":
      return createFolder(user.id, req.body, res);
    case "PUT":
      return updateFolder(user.id, req.body, res);
    case "DELETE":
      return deleteFolder(user.id, req.body, res);
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res
        .status(405)
        .json({ error: `Method ${req.method} Not Allowed` });
  }
}

async function getFolders(userId, res) {
  try {
    const { data, error } = await supabase
      .from("folders")
      .select("*, bookmarks(count)")
      .eq("user_id", userId)
      .order("position");

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return res.status(500).json({ error: "Error fetching folders" });
  }
}

async function createFolder(userId, { name, color }, res) {
  if (!name) {
    return res.status(400).json({ error: "Folder name is required" });
  }

  try {
    // Get the highest current position
    const { data: maxPositionData } = await supabase
      .from("folders")
      .select("position")
      .eq("user_id", userId)
      .order("position", { ascending: false })
      .limit(1)
      .single();

    const newPosition = maxPositionData ? maxPositionData.position + 1 : 0;

    const { data, error } = await supabase
      .from("folders")
      .insert({
        user_id: userId,
        name,
        color,
        position: newPosition,
      })
      .select();

    if (error || !data) {
      throw new Error("Folder creation failed");
    }

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error creating folder:", error);
    return res.status(500).json({ error: "Error creating folder" });
  }
}

async function updateFolder(userId, { id, name, color, position }, res) {
  if (!id || (!name && !color && position === undefined)) {
    return res
      .status(400)
      .json({
        error: "Folder ID and at least one field to update are required",
      });
  }

  try {
    const updates = {};
    if (name) updates.name = name;
    if (color) updates.color = color;
    if (position !== undefined) updates.position = position;

    const { data, error } = await supabase
      .from("folders")
      .update(updates)
      .match({ id, user_id: userId })
      .select();

    if (error || !data) {
      throw new Error("Folder update failed");
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error("Error updating folder:", error);
    return res.status(500).json({ error: "Error updating folder" });
  }
}

async function deleteFolder(userId, { id }, res) {
  if (!id) {
    return res.status(400).json({ error: "Folder ID is required" });
  }

  try {
    // Prevent deletion of 'Uncategorized' folder
    const { data: folderToDelete } = await supabase
      .from("folders")
      .select("name")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (folderToDelete.name === "Uncategorized") {
      return res
        .status(403)
        .json({ error: "Cannot delete the Uncategorized folder" });
    }

    // Get or create 'Uncategorized' folder
    let { data: uncategorizedFolder } = await supabase
      .from("folders")
      .select("id")
      .eq("user_id", userId)
      .eq("name", "Uncategorized")
      .maybeSingle();

    if (!uncategorizedFolder) {
      const { data: newUncategorizedFolder, error: uncategorizedError } =
        await supabase
          .from("folders")
          .insert({
            user_id: userId,
            name: "Uncategorized",
            color: "#A0AEC0", // Default gray color
            position: 0,
          })
          .select()
          .single();

      if (uncategorizedError) throw uncategorizedError;

      uncategorizedFolder = newUncategorizedFolder;
    }

    await supabase
      .from("bookmarks")
      .update({ folder_id: uncategorizedFolder.id })
      .match({ folder_id: id, user_id: userId });

    const { error } = await supabase
      .from("folders")
      .delete()
      .match({ id, user_id: userId });

    if (error) throw error;

    return res.status(204).end();
  } catch (error) {
    console.error("Error deleting folder:", error);
    return res.status(500).json({ error: "Error deleting folder" });
  }
}
