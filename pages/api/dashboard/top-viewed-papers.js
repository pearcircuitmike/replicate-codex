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

      // Fetch the generatedSummary and thumbnail from arxivPapersData for each paper
      const paperIds = data.map((paper) => paper.uuid);
      const { data: summaryData, error: summaryError } = await supabase
        .from("arxivPapersData")
        .select("id, generatedSummary, thumbnail")
        .in("id", paperIds);

      if (summaryError) throw summaryError;

      // Merge the summaries and thumbnails with the original data
      const enrichedData = data.map((paper) => {
        const matchedSummary = summaryData.find(
          (summary) => summary.id === paper.uuid
        );
        return {
          ...paper,
          generatedSummary: matchedSummary?.generatedSummary || null,
          thumbnail: matchedSummary?.thumbnail || null, // Include the thumbnail
        };
      });

      res.status(200).json(enrichedData);
    } catch (error) {
      console.error(
        "Error fetching top viewed papers with summaries and thumbnails:",
        error
      );
      res
        .status(500)
        .json({ error: "An error occurred while fetching top viewed papers" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
