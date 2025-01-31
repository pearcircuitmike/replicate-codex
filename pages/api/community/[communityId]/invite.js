// pages/api/community/[communityId]/invite.js
import supabase from "../../utils/supabaseClient";

export default async function handler(req, res) {
  const { communityId } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { inviteeEmail, invitedBy } = req.body;

    if (!inviteeEmail) {
      return res
        .status(400)
        .json({ error: "Missing inviteeEmail in request body." });
    }
    if (!invitedBy) {
      return res
        .status(400)
        .json({ error: "Missing invitedBy (the user who sends invite)." });
    }

    // 1) Check if user with that email already has a profile
    const { data: userProfile, error: userErr } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", inviteeEmail) // case-insensitive
      .single();

    // If supabase returned an error that isn't "no rows found"
    if (userErr && userErr.code !== "PGRST116") {
      throw userErr;
    }

    // 2) If userProfile exists, see if they're already in community_members
    if (userProfile) {
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
        return res.status(200).json({
          message: "User is already a member of this community.",
        });
      }

      // 3) User exists but is not a member -> create invite
      const { data: inviteData, error: inviteError } = await supabase
        .from("community_invites")
        .insert({
          community_id: communityId,
          invited_by: invitedBy, // Must be a valid profile ID
          invitee_email: inviteeEmail,
          // status: 'pending' // if you want to specify; by default is 'pending'
        })
        .single();

      if (inviteError) throw inviteError;

      return res.status(201).json({
        message: "Invite created successfully.",
        invite: inviteData,
      });
    } else {
      // 4) No user with that email -> still create invite
      const { data: inviteData, error: inviteError } = await supabase
        .from("community_invites")
        .insert({
          community_id: communityId,
          invited_by: invitedBy, // Must be a valid profile ID
          invitee_email: inviteeEmail,
        })
        .single();

      if (inviteError) throw inviteError;

      return res.status(201).json({
        message: "No existing user. Invite record created.",
        invite: inviteData,
      });
    }
  } catch (error) {
    console.error("Error in POST /invite:", error);
    return res.status(500).json({ error: error.message });
  }
}
