// pages/api/community/[communityId]/invite.js
import supabase from "../../utils/supabaseClient";

export default async function handler(req, res) {
  const { communityId } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { inviteeEmail } = req.body;
    if (!inviteeEmail) {
      return res
        .status(400)
        .json({ error: "Missing inviteeEmail in request body." });
    }

    // For example: you might store invitations in a table called `community_invites`.
    // Or maybe you want to see if the user is already in the community.
    // This is just an example:

    // 1) See if user with that email already has an account
    const { data: userProfile, error: userErr } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", inviteeEmail) // case-insensitive
      .single();

    if (userErr && userErr.code !== "PGRST116") {
      // PGRST116 = no rows
      throw userErr;
    }

    if (userProfile) {
      // That user exists. Check if they’re already a member of this community
      const { data: existingMembership, error: memErr } = await supabase
        .from("community_members")
        .select("id")
        .eq("user_id", userProfile.id)
        .eq("community_id", communityId)
        .single();

      if (memErr && memErr.code !== "PGRST116") {
        throw memErr;
      }

      if (existingMembership) {
        return res
          .status(200)
          .json({ message: "User is already a member of this community." });
      }

      // Otherwise, you could create a record in `community_invites`
      // Then an email can be sent, etc.
      // This is just a placeholder:
      return res
        .status(201)
        .json({ message: "Invite created or user notified of invite." });
    } else {
      // If there’s no existing user, you might do something else:
      // Create an invite record, send an email link to sign up, etc.
      return res
        .status(201)
        .json({ message: "No existing user. Sent them an invite link." });
    }
  } catch (error) {
    console.error("Error in POST invite:", error);
    return res.status(500).json({ error: error.message });
  }
}
