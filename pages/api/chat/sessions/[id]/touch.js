import supabase from "@/pages/api/utils/supabaseClient";

/**
 * API endpoint to update the timestamp of a chat session
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  const { user_id } = req.body;

  if (!id || !user_id) {
    return res.status(400).json({ message: "Missing session ID or user ID" });
  }

  try {
    // Verify user owns this session
    const { data: existingSession, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", id)
      .eq("user_id", user_id)
      .single();

    if (sessionError || !existingSession) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this session" });
    }

    // Update just the timestamp
    const { data, error } = await supabase
      .from("chat_sessions")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return res.status(200).json({ session: data });
  } catch (error) {
    console.error("Error updating chat session timestamp:", error);
    return res.status(500).json({ message: error.message });
  }
}
