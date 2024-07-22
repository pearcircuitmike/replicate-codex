// pages/api/dashboard/top-viewed-papers.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("top_paper_views")
        .select("uuid, title, slug, view_count")
        .order("view_count", { ascending: false })
        .limit(4);

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching top viewed papers:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching top viewed papers" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
