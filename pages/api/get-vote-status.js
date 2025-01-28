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
    let userId = null;

    // 1. If token is present, check if user is authenticated
    if (token) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);

      if (authError) {
        // If there's an auth error, log it but don't throw right away
        console.error("Supabase auth error verifying user token:", authError);
      }

      if (user) {
        userId = user.id;

        // Fetch user vote from user_paper_votes
        const { data: voteData, error: voteError } = await supabase
          .from("user_paper_votes")
          .select("vote")
          .eq("user_id", user.id)
          .eq("paper_id", paperId)
          .single();

        if (voteError) {
          // Log the detailed error
          console.error("Error fetching user vote:", {
            message: voteError.message,
            details: voteError,
            paperId,
            userId,
          });
          throw voteError; // Return a 500 below
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
      console.error("Error fetching paperData:", {
        message: paperError.message,
        details: paperError,
        paperId,
        userId,
      });
      throw paperError;
    }

    if (!paperData) {
      // If there's no row for this paper, return 404
      console.error("No row in arxivPapersData for ID:", paperId);
      return res.status(404).json({ error: "Paper not found" });
    }

    // If totalScore is null, default to 0
    const totalScore = paperData.totalScore ?? 0;

    return res.status(200).json({
      userVote,
      totalScore,
    });
  } catch (error) {
    console.error("Error fetching vote status:", {
      message: error.message,
      stack: error.stack,
      paperId,
    });
    return res.status(500).json({ error: "Failed to get vote status" });
  }
}
