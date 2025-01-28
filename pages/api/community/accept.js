// pages/api/community/accept.js
import supabase from "../utils/supabaseClient";
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // read token from Authorization
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const { inviteId } = req.body;
  if (!inviteId) {
    return res.status(400).json({ error: "inviteId is required" });
  }

  try {
    // Validate user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Look up invite
    const { data: invite, error: inviteError } = await supabase
      .from("community_invites")
      .select("*")
      .eq("id", inviteId)
      .maybeSingle();

    if (inviteError || !invite) {
      return res.status(404).json({ error: "Invite not found" });
    }

    // Check status
    if (invite.status === "accepted") {
      return res.status(400).json({ error: "Invite already accepted" });
    }
    if (invite.status === "expired") {
      return res.status(400).json({ error: "Invite expired" });
    }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      // Mark expired
      await supabase
        .from("community_invites")
        .update({ status: "expired" })
        .eq("id", invite.id);

      return res.status(400).json({ error: "Invite is expired" });
    }

    if (user.email.toLowerCase() !== invite.invitee_email.toLowerCase()) {
      return res.status(403).json({ error: "Invite is for a different email" });
    }

    // Accept
    const { error: updateError } = await supabase
      .from("community_invites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    // Add to community_members if not already
    const { data: existingMember } = await supabase
      .from("community_members")
      .select("*")
      .eq("community_id", invite.community_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existingMember) {
      const { error: insertError } = await supabase
        .from("community_members")
        .insert([
          {
            community_id: invite.community_id,
            user_id: user.id,
          },
        ]);
      if (insertError) {
        return res.status(500).json({ error: insertError.message });
      }
    }

    // Return success with the communityId
    return res
      .status(200)
      .json({ success: true, communityId: invite.community_id });
  } catch (err) {
    console.error("Error accepting invite:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
