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

    // 1. If user is logged in, look up their vote
    if (token) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);

      if (!authError && user) {
        const { data: voteData, error: voteError } = await supabase
          .from("user_paper_votes")
          .select("vote")
          .eq("user_id", user.id)
          .eq("paper_id", paperId)
          .single();

        if (voteError) {
          throw voteError;
        }
        if (voteData) {
          userVote = voteData.vote;
        }
      }
    }

    // 2. Fetch paper’s totalScore from arxivPapersData
    const { data: paperData, error: paperError } = await supabase
      .from("arxivPapersData")
      .select("totalScore")
      .eq("id", paperId)
      .single();

    if (paperError) {
      throw paperError;
    }

    // If the column is null, default to 0
    const totalScore = paperData?.totalScore || 0;

    return res.status(200).json({
      userVote,
      totalScore,
    });
  } catch (error) {
    console.error("Error fetching vote status:", error);
    return res.status(500).json({ error: "Failed to get vote status" });
  }
}
