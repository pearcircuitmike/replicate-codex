// pages/api/community/list.js
import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.query || {};

    // Call the RPC function with userId (can be null)
    const { data, error } = await supabase.rpc("get_communities_data", {
      user_id: userId || null,
    });

    if (error) throw error;

    // Ensure proper structure if data is null
    const result = data || {
      myCommunities: [],
      otherCommunities: [],
      avatarMap: {},
      membershipCountMap: {},
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in /api/community/list:", error);
    return res.status(500).json({ error: error.message });
  }
}
