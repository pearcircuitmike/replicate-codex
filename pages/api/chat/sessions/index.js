// pages/api/chat/sessions/index.js

import supabase from "../../utils/supabaseClient";

/**
 * API endpoint for managing chat sessions
 */
export default async function handler(req, res) {
  const user_id = req.headers["x-user-id"] || req.body?.user_id;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // GET - List all sessions for a user
  if (req.method === "GET") {
    try {
      const { data: sessions, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user_id)
        .order("updated_at", { ascending: false });

      if (error) throw new Error(error.message);

      return res.status(200).json({ sessions });
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  // POST - Create a new session
  else if (req.method === "POST") {
    try {
      const { title = "New Chat" } = req.body;

      // Create new session
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert([
          {
            user_id,
            title,
          },
        ])
        .select();

      if (error) throw new Error(error.message);

      return res.status(201).json({ session: data[0] });
    } catch (error) {
      console.error("Error creating chat session:", error);
      return res.status(500).json({ message: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
