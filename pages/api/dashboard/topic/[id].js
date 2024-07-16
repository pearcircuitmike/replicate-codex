// pages/api/dashboard/topic/[id].js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      // Fetch topic details
      const { data: topic, error: topicError } = await supabase
        .from("topic_modeling_results")
        .select("*")
        .eq("id", id)
        .single();

      if (topicError) throw topicError;

      // Fetch associated papers
      const { data: papers, error: papersError } = await supabase
        .from("arxivPapersData")
        .select("*")
        .filter("id", "in", `(${topic.paper_ids.join(",")})`);

      if (papersError) throw papersError;

      // Sort papers based on their position in topic.paper_ids
      const sortedPapers = papers.sort(
        (a, b) => topic.paper_ids.indexOf(a.id) - topic.paper_ids.indexOf(b.id)
      );

      res.status(200).json({ ...topic, papers: sortedPapers });
    } catch (error) {
      console.error("Error fetching topic and papers:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching topic and papers" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
