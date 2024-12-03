// pages/api/get-vote-status.js
import supabase from "./utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  const { paperId } = req.query;

  if (!paperId) {
    return res.status(400).json({ error: "Paper ID required" });
  }

  try {
    let userVote = 0;

    // Get user's vote if they're authenticated
    if (token) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);

      if (!authError && user) {
        const { data: voteData } = await supabase
          .from("user_paper_votes")
          .select("vote")
          .eq("user_id", user.id)
          .eq("paper_id", paperId)
          .single();

        if (voteData) {
          userVote = voteData.vote;
        }
      }
    }

    // Get total score (this should happen regardless of auth status)
    const { data: totalData, error: totalError } = await supabase
      .from("user_paper_votes")
      .select("vote")
      .eq("paper_id", paperId);

    if (totalError) throw totalError;

    // Calculate total score
    const totalScore = totalData.reduce((sum, record) => sum + record.vote, 0);

    res.status(200).json({
      userVote,
      totalScore,
    });
  } catch (error) {
    console.error("Error getting vote status:", error);
    res.status(500).json({ error: "Failed to get vote status" });
  }
}
