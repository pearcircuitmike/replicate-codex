// pages/api/record-vote.js
import supabase from "./utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  const { paperId, vote } = req.body;

  if (!paperId || typeof vote !== "number") {
    return res
      .status(400)
      .json({ error: "Paper ID and numeric vote required" });
  }

  try {
    // Confirm user is logged in
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Insert or update the user’s vote
    const { error: upsertError } = await supabase
      .from("user_paper_votes")
      .upsert(
        {
          user_id: user.id,
          paper_id: paperId,
          vote,
        },
        { onConflict: "user_id, paper_id" }
      )
      .single();

    if (upsertError) {
      throw upsertError;
    }

    // DB trigger automatically updates arxivPapersData.totalScore
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error recording vote:", error);
    return res.status(500).json({ error: "Failed to record vote" });
  }
}
