// pages/api/dashboard/top-search-queries.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("top_search_queries")
        .select("uuid, search_query, resource_type, search_count")
        .order("search_count", { ascending: false })
        .limit(12);

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching top search queries:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching top search queries" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
