// pages/api/preferences.js
import supabase from "./utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const { papers_digest_preference, models_digest_preference, userId } =
    req.body;

  // Validate preferences
  const validPreferences = ["weekly", "daily", "monthly", "none"];
  if (
    papers_digest_preference &&
    !validPreferences.includes(papers_digest_preference)
  ) {
    return res.status(400).json({ error: "Invalid papers digest preference" });
  }
  if (
    models_digest_preference &&
    !validPreferences.includes(models_digest_preference)
  ) {
    return res.status(400).json({ error: "Invalid models digest preference" });
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Security check: Ensure the authenticated user can only update their own preferences
    if (userId && userId !== user.id) {
      return res.status(403).json({
        error: "Unauthorized: You can only update your own preferences",
      });
    }

    // Update preferences
    const updateData = {};
    if (papers_digest_preference) {
      updateData.papers_digest_preference = papers_digest_preference;
    }
    if (models_digest_preference) {
      updateData.models_digest_preference = models_digest_preference;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id) // This ensures we're only updating the authenticated user's profile
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      message: "Preferences updated successfully",
      preferences: data,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({
      error: "An error occurred while updating preferences",
    });
  }
}
