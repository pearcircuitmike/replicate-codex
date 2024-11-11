import supabase from "../utils/supabaseClient";
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { userId, signupSource } = req.body;
  if (!userId || !signupSource) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ error: "No authorization header" });
  }
  try {
    // Check current signup_source value
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("signup_source")
      .eq("id", userId)
      .single();
    if (profileError) {
      console.error("Profile error:", profileError);
      return res.status(500).json({ error: "Failed to check profile status" });
    }
    // Only proceed if signup_source is null
    if (profile.signup_source) {
      return res.status(400).json({ error: "Signup source already set" });
    }
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
    // Update the signup_source field
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ signup_source: signupSource })
      .eq("id", userId);
    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ error: "Failed to update signup source" });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in API route:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
