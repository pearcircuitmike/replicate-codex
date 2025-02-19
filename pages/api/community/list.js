// pages/api/community/list.js
import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.query || {};
    // 1) Fetch all communities
    const { data: allComms, error: commErr } = await supabase
      .from("communities")
      .select(
        `
        *,
        community_tasks (
          task_id,
          tasks (
            id,
            task
          )
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (commErr) throw commErr;
    if (!allComms) {
      return res.status(200).json({
        myCommunities: [],
        otherCommunities: [],
        avatarMap: {},
        membershipCountMap: {},
      });
    }

    // 2) If userId is provided, find which communities they belong to
    let userMemberSet = new Set();
    if (userId) {
      const { data: memberships, error: memErr } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", userId)
        .limit(2000);
      if (memErr) throw memErr;

      userMemberSet = new Set(memberships.map((m) => m.community_id));
    }

    // Split into "mine" vs "others"
    const mine = [];
    const others = [];

    for (const c of allComms) {
      if (userMemberSet.has(c.id)) {
        mine.push(c);
      } else {
        others.push(c);
      }
    }

    // Get community IDs for fetching
    const commIds = allComms.map((c) => c.id);

    // 3) Get ACCURATE member counts using separate COUNT queries
    const membershipCountMap = {};

    // We need to run individual queries for each community to get accurate counts
    // since group_by isn't available in this supabase client version
    for (const communityId of commIds) {
      const { count, error: countErr } = await supabase
        .from("community_members")
        .select("*", { count: "exact", head: true })
        .eq("community_id", communityId);

      if (!countErr) {
        membershipCountMap[communityId] = count;
      }
    }

    // 4) Fetch members for avatars (limited to 5 per community)
    // Need to run separate queries for each community to limit properly
    const avatarMap = {};

    for (const communityId of commIds) {
      const { data: members, error: membersErr } = await supabase
        .from("community_members")
        .select("user_id")
        .eq("community_id", communityId)
        .limit(5);

      if (!membersErr && members) {
        const userIds = members.map((m) => m.user_id);

        if (userIds.length > 0) {
          const { data: profiles, error: profilesErr } = await supabase
            .from("public_profile_info")
            .select("id, full_name, avatar_url, username")
            .in("id", userIds);

          if (!profilesErr && profiles) {
            avatarMap[communityId] = profiles.map((p) => ({
              user_id: p.id,
              avatar_url: p.avatar_url || "",
              full_name: p.full_name || "Anonymous",
            }));
          }
        } else {
          avatarMap[communityId] = [];
        }
      }
    }

    return res.status(200).json({
      myCommunities: mine,
      otherCommunities: others,
      avatarMap,
      membershipCountMap,
    });
  } catch (error) {
    console.error("Error in /api/community/list:", error);
    return res.status(500).json({ error: error.message });
  }
}
