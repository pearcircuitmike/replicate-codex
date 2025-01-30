// pages/api/community/[communityId]/papers.js
import supabase from "../../utils/supabaseClient";
import { getDateRange } from "../../utils/dateUtils";

export default async function handler(req, res) {
  const { communityId } = req.query;
  const { timeRange } = req.query || {};

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1) Fetch the task IDs for this community
    const { data: taskRows, error: taskErr } = await supabase
      .from("community_tasks")
      .select("task_id")
      .eq("community_id", communityId)
      .limit(1000);

    if (taskErr) throw taskErr;
    if (!taskRows || taskRows.length === 0) {
      return res.status(200).json([]);
    }

    const taskIds = taskRows.map((r) => r.task_id);

    // 2) Build query for papers that overlap these taskIds
    let q = supabase
      .from("arxivPapersData")
      .select(
        `
        id, slug, title, authors,
        generatedSummary, publishedDate, totalScore,
        indexedDate, thumbnail, platform
      `
      )
      .overlaps("task_ids", taskIds)
      .order("totalScore", { ascending: false })
      .limit(200);

    // 3) If user gave a timeRange, filter by publishedDate
    if (timeRange) {
      const { startDate, endDate } = getDateRange(timeRange);
      if (startDate && endDate) {
        q = q
          .gte("publishedDate", startDate.toISOString())
          .lte("publishedDate", endDate.toISOString());
      }
    }

    // 4) Run final query
    const { data: papers, error: papersErr } = await q;
    if (papersErr) throw papersErr;

    return res.status(200).json(papers || []);
  } catch (error) {
    console.error("Error in GET community papers:", error);
    return res.status(500).json({ error: error.message });
  }
}
