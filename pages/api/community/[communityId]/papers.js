// pages/api/community/[communityId]/papers.js
import supabase from "../../utils/supabaseClient";
import { getDateRange } from "../../utils/dateUtils";

export default async function handler(req, res) {
  const { communityId, timeRange, page, pageSize } = req.query;

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
      return res.status(200).json({ data: [], totalCount: 0 });
    }
    const taskIds = taskRows.map((r) => r.task_id);

    // 2) Calculate pagination values
    const pageNumber = parseInt(page, 10) || 1;
    const pageSizeNumber = parseInt(pageSize, 10) || 12;
    const start = (pageNumber - 1) * pageSizeNumber;
    const end = start + pageSizeNumber - 1;

    // 3) Build the query for papers overlapping these task IDs
    let query = supabase
      .from("arxivPapersData")
      .select(
        `
        id, slug, title, authors,
        generatedSummary, publishedDate, totalScore,
        indexedDate, thumbnail, platform
        `,
        { count: "exact" }
      )
      .overlaps("task_ids", taskIds)
      .order("totalScore", { ascending: false });

    // 4) If a timeRange is provided, filter by publishedDate
    if (timeRange) {
      const { startDate, endDate } = getDateRange(timeRange);
      if (startDate && endDate) {
        query = query
          .gte("publishedDate", startDate.toISOString())
          .lte("publishedDate", endDate.toISOString());
      }
    }

    // 5) Apply pagination
    query = query.range(start, end);

    // 6) Run the query
    const { data: papers, error: papersErr, count } = await query;
    if (papersErr) throw papersErr;

    return res.status(200).json({ data: papers || [], totalCount: count || 0 });
  } catch (error) {
    console.error("Error in GET community papers:", error);
    return res.status(500).json({ error: error.message });
  }
}
