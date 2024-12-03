// pages/api/record-vote.js
import supabase from "./utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  const { paperId, vote } = req.body;

  if (!token) {
    return res.status(401).json({ error: "No authorization token provided" });
  }

  if (!paperId || ![-1, 0, 1].includes(vote)) {
    return res.status(400).json({ error: "Invalid vote parameters" });
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { data, error } = await supabase
      .from("user_paper_votes")
      .upsert(
        {
          user_id: user.id,
          paper_id: paperId,
          vote: vote,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,paper_id" }
      )
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      message: "Vote recorded successfully",
      vote: data,
    });
  } catch (error) {
    console.error("Error recording vote:", error);
    res.status(500).json({ error: "Failed to record vote" });
  }
}
