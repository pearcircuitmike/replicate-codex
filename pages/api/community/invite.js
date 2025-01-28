// pages/api/community/invite.js
import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1) Parse token from Authorization header
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Missing or invalid authorization token" });
  }

  // 2) Parse body
  const { communityId, inviteeEmail } = req.body || {};
  if (!communityId || !inviteeEmail) {
    return res
      .status(400)
      .json({ error: "communityId and inviteeEmail are required" });
  }

  try {
    // 3) Validate user from token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // 3A) Rate limit check: max 5 invites from this user in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentInvites, error: invitesErr } = await supabase
      .from("community_invites")
      .select("id")
      .eq("invited_by", user.id)
      .gte("created_at", oneDayAgo);

    if (invitesErr) {
      console.error("Error checking invites:", invitesErr);
      return res
        .status(500)
        .json({ error: "Failed to check existing invites" });
    }

    if ((recentInvites?.length || 0) >= 5) {
      return res
        .status(429)
        .json({ error: "Invite limit reached. Try again tomorrow." });
    }

    // 3B) Check if an invite for this (communityId + inviteeEmail) already exists
    const { data: existingInvite, error: existingErr } = await supabase
      .from("community_invites")
      .select("*")
      .eq("community_id", communityId)
      .eq("invitee_email", inviteeEmail.trim().toLowerCase())
      .maybeSingle();

    if (existingErr && existingErr.code !== "PGRST116") {
      // 'PGRST116' => no rows found. If there's a different error, throw it
      throw existingErr;
    }

    if (existingInvite) {
      return res
        .status(200)
        .json({ message: "Invite already exists for that user+community" });
    }

    // 4) Insert row in "community_invites"
    const { data, error } = await supabase
      .from("community_invites")
      .insert([
        {
          community_id: communityId,
          invited_by: user.id, // The current user from the token
          invitee_email: inviteeEmail.trim().toLowerCase(),
          // e.g. status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    // 5) Return success
    return res.status(201).json({
      message: "Invite created successfully",
      invite: data,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
