import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { session_id, content, user_id, rag_context } = req.body;

  if (!session_id || !content || !user_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Verify this session belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", session_id)
      .eq("user_id", user_id)
      .single();

    if (sessionError || !session) {
      return res
        .status(403)
        .json({ message: "Unauthorized to add messages to this session" });
    }

    // Save the assistant response
    const { data, error } = await supabase
      .from("chat_messages")
      .insert([
        {
          session_id,
          role: "assistant",
          content,
          rag_context: rag_context || null,
        },
      ])
      .select();

    if (error) throw new Error(error.message);

    // Update the session timestamp
    await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", session_id);

    return res.status(201).json({ message: data[0] });
  } catch (error) {
    console.error("Error saving assistant response:", error);
    return res.status(500).json({ message: error.message });
  }
}
