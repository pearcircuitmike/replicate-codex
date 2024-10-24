import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { offset = 0 } = req.query;

    try {
      const { data, error, count } = await supabase
        .from("weekly_summaries_models")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(parseInt(offset), parseInt(offset));

      if (error) throw error;

      res.status(200).json({
        data: data[0],
        totalCount: count,
      });
    } catch (error) {
      console.error("Error in weekly model summaries API:", error);
      res.status(500).json({
        error: "An error occurred while fetching weekly model summaries",
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
