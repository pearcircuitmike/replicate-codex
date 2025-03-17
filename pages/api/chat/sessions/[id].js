import supabase from "../../utils/supabaseClient";

export default async function handler(req, res) {
  const { id } = req.query;
  const user_id = req.body?.user_id || req.headers["x-user-id"];

  if (!id || !user_id) {
    return res.status(400).json({ message: "Missing session ID or user ID" });
  }

  // GET - fetch session and messages
  if (req.method === "GET") {
    try {
      // First check that the session belongs to this user
      const { data: session, error: sessionError } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("id", id)
        .eq("user_id", user_id)
        .single();

      if (sessionError || !session) {
        return res
          .status(404)
          .json({ message: "Session not found or unauthorized" });
      }

      // Then get all messages for this session
      const { data: messages, error: messagesError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", id)
        .order("created_at", { ascending: true });

      if (messagesError) throw new Error(messagesError.message);

      return res.status(200).json({
        session,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          id: msg.id,
          created_at: msg.created_at,
        })),
      });
    } catch (error) {
      console.error("Error fetching chat session:", error);
      return res.status(500).json({ message: error.message });
    }
  }
  // PATCH - update session details
  else if (req.method === "PATCH") {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Missing title field" });
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

      // Update the session
      const { data, error } = await supabase
        .from("chat_sessions")
        .update({
          title,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return res.status(200).json({ session: data });
    } catch (error) {
      console.error("Error updating chat session:", error);
      return res.status(500).json({ message: error.message });
    }
  }
  // DELETE - delete a session
  else if (req.method === "DELETE") {
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
          .json({ message: "Unauthorized to delete this session" });
      }

      // Delete the session (messages will cascade)
      const { error } = await supabase
        .from("chat_sessions")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);

      return res.status(200).json({ message: "Session deleted successfully" });
    } catch (error) {
      console.error("Error deleting chat session:", error);
      return res.status(500).json({ message: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
