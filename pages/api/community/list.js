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

    // Split into “mine” vs “others”
    const mine = [];
    const others = [];

    for (const c of allComms) {
      if (userMemberSet.has(c.id)) {
        mine.push(c);
      } else {
        others.push(c);
      }
    }

    // 3) Fetch all membership rows for these communities
    const commIds = allComms.map((c) => c.id);
    const { data: allRows, error: allRowsErr } = await supabase
      .from("community_members")
      .select("community_id, user_id")
      .in("community_id", commIds)
      .limit(5000);

    if (allRowsErr) throw allRowsErr;

    // Build membershipMap => array of user IDs per community
    const membershipMap = {};
    for (const row of allRows) {
      if (!membershipMap[row.community_id]) {
        membershipMap[row.community_id] = [];
      }
      membershipMap[row.community_id].push(row.user_id);
    }

    // 4) Build membershipCountMap
    const membershipCountMap = {};
    for (const [cId, userIds] of Object.entries(membershipMap)) {
      membershipCountMap[cId] = userIds.length;
    }

    // 5) Gather all unique user IDs
    const uniqueUserIds = [...new Set(allRows.map((r) => r.user_id))];

    // 6) Fetch profile info
    let profileMap = {};
    if (uniqueUserIds.length > 0) {
      const { data: profileRows, error: profErr } = await supabase
        .from("public_profile_info")
        .select("id, full_name, avatar_url, username")
        .in("id", uniqueUserIds)
        .limit(5000);
      if (profErr) throw profErr;

      profileMap = {};
      (profileRows || []).forEach((p) => {
        profileMap[p.id] = {
          full_name: p.full_name || "Anonymous",
          avatar_url: p.avatar_url || "",
          username: p.username || "",
        };
      });
    }

    // 7) Build an avatarMap => first 5 user avatars for each community
    const avatarMap = {};
    for (const cId of Object.keys(membershipMap)) {
      const userIds = membershipMap[cId];
      const topFive = userIds.slice(0, 5);
      avatarMap[cId] = topFive.map((uid) => ({
        user_id: uid,
        avatar_url: profileMap[uid]?.avatar_url || "",
        full_name: profileMap[uid]?.full_name || "Anonymous",
      }));
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
