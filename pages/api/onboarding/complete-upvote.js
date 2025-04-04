// pages/api/onboarding/complete-upvote.js
import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.body;
  if (!userId) {
    return res
      .status(400)
      .json({ error: "Missing required parameter: userId" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ error: "No authorization header" });
  }

  try {
    // Validate token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      console.error("Auth error:", authError);
      return res.status(403).json({ error: "Unauthorized - Invalid token" });
    }

    if (user.id !== userId) {
      console.error("User ID mismatch:", user.id, userId);
      return res.status(403).json({ error: "Unauthorized - User mismatch" });
    }

    // Update upvote_onboarded to true
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ upvote_onboarded: true })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update upvote_onboarded:", updateError);
      return res
        .status(500)
        .json({ error: "Failed to update upvote_onboarded" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in complete-upvote route:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
