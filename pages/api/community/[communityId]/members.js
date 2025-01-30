// pages/api/community/[communityId]/members.js
import supabase from "../../utils/supabaseClient";

export default async function handler(req, res) {
  const { communityId } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1) Find all membership rows
    const { data: rows, error: memErr } = await supabase
      .from("community_members")
      .select("user_id")
      .eq("community_id", communityId)
      .limit(2000);

    if (memErr) throw memErr;

    if (!rows || rows.length === 0) {
      return res.status(200).json([]);
    }

    // 2) Grab unique user IDs, fetch from public_profile_info
    const userIds = rows.map((r) => r.user_id);

    const { data: profRows, error: profErr } = await supabase
      .from("public_profile_info")
      .select("id, full_name, avatar_url, username")
      .in("id", userIds)
      .limit(2000);

    if (profErr) throw profErr;

    return res.status(200).json(profRows || []);
  } catch (error) {
    console.error("Error in GET community members:", error);
    return res.status(500).json({ error: error.message });
  }
}
