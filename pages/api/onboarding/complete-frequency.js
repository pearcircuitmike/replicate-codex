import supabase from "../utils/supabaseClient";
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, frequency } = req.body;
  if (!userId || !frequency) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ error: "No authorization header" });
  }

  try {
    // 1) Validate the token
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

    // 2) Mark frequency_onboarded as true in the profiles table
    const { error: updateOnboardedError } = await supabase
      .from("profiles")
      .update({ frequency_onboarded: true })
      .eq("id", userId);

    if (updateOnboardedError) {
      console.error(
        "Update error (profiles.frequency_onboarded):",
        updateOnboardedError
      );
      return res
        .status(500)
        .json({ error: "Failed to update onboarding status" });
    }

    // 3) Update the digest_subscriptions frequencies
    //    We'll store the same frequency in both papers_frequency & models_frequency,
    //    but feel free to customize if you want them handled separately.
    const { error: updateSubError } = await supabase
      .from("digest_subscriptions")
      .update({
        papers_frequency: frequency,
        models_frequency: frequency,
      })
      .eq("user_id", userId);

    if (updateSubError) {
      console.error("Update error (digest_subscriptions):", updateSubError);
      return res
        .status(500)
        .json({ error: "Failed to update digest subscription frequency" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in API route:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
