import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  const startApi = Date.now(); // Track when this request started

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.query || {};

    // 1) Call the RPC
    const startDbCall = Date.now();
    const { data, error } = await supabase.rpc("get_communities_data", {
      user_id: userId || null,
    });
    const endDbCall = Date.now();
    console.log("Supabase RPC call took:", endDbCall - startDbCall, "ms");

    if (error) throw error;

    // 2) Shape or finalize data
    const startShape = Date.now();
    const result = data || {
      myCommunities: [],
      otherCommunities: [],
      avatarMap: {},
      membershipCountMap: {},
    };
    const endShape = Date.now();
    console.log("Data shaping took:", endShape - startShape, "ms");

    // 3) Send response
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in /api/community/list:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    console.log("Total API time:", Date.now() - startApi, "ms");
  }
}
