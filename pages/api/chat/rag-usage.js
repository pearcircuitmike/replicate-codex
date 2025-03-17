import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * API endpoint to count RAG chat usage for a specific user
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ message: "Missing user_id parameter" });
  }

  try {
    const { count, error } = await supabase
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "ragchat")
      .eq("user_id", user_id);

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching ragchat usage:", error);
    return res.status(500).json({ message: error.message });
  }
}
