// pages/api/dashboard/trending-topics.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("topic_modeling_results")
        .select("id, created_at, topic_name, keywords, keyword_probabilities")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching trending topics" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
