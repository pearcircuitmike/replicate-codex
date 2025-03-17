import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return getSessions(req, res);
  } else if (req.method === "POST") {
    return createSession(req, res);
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}

async function getSessions(req, res) {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("id, title, created_at, updated_at")
      .eq("user_id", user_id)
      .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);

    return res.status(200).json({ sessions: data });
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return res.status(500).json({ message: error.message });
  }
}

async function createSession(req, res) {
  const { user_id, title } = req.body;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert([
        {
          user_id,
          title: title || "New Chat",
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return res.status(201).json({ session: data });
  } catch (error) {
    console.error("Error creating chat session:", error);
    return res.status(500).json({ message: error.message });
  }
}
