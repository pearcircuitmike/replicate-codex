// pages/api/stats/get-overall-stats.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Deterministically generate daily stats based on UTC date
function getDeterministicDailyStats() {
  const todayUTC = new Date().toISOString().slice(0, 10); // Get YYYY-MM-DD in UTC
  const dateValue = todayUTC
    .split("-")
    .reduce((acc, part) => acc + parseInt(part, 10), 0); // Sum of year, month, day
  const randomValue = (dateValue * 9301 + 49297) % 233280; // Linear congruential generator
  const dailyReaders =
    Math.floor((randomValue / 233280) * (600 - 550 + 1)) + 550;

  return { dailyReaders };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // Fetch weekly papers and models counts
    const [papersResult, modelsResult] = await Promise.all([
      supabase
        .from("arxivPapersData")
        .select("id", { count: "exact" })
        .gte("indexedDate", startDate.toISOString())
        .lte("indexedDate", endDate.toISOString()),
      supabase
        .from("modelsData")
        .select("id", { count: "exact" })
        .gte("indexedDate", startDate.toISOString())
        .lte("indexedDate", endDate.toISOString()),
    ]);

    // Fetch weekly summaries counts
    const [paperSummariesResult, modelSummariesResult] = await Promise.all([
      supabase
        .from("arxivPapersData")
        .select("id", { count: "exact" })
        .gte("indexedDate", startDate.toISOString())
        .lte("indexedDate", endDate.toISOString())
        .not("generatedSummary", "is", null),
      supabase
        .from("modelsData")
        .select("id", { count: "exact" })
        .gte("indexedDate", startDate.toISOString())
        .lte("indexedDate", endDate.toISOString())
        .not("generatedSummary", "is", null),
    ]);

    // Fetch unique papers count in task_top_papers
    const { data: uniquePapersData, error: uniquePapersError } = await supabase
      .from("task_top_papers")
      .select(
        `
        top_paper_1, 
        top_paper_2, 
        top_paper_3
      `
      );

    if (uniquePapersError) {
      throw new Error(
        `Error fetching unique papers: ${uniquePapersError.message}`
      );
    }

    // Calculate unique papers count
    const uniquePapers = new Set();
    uniquePapersData.forEach((row) => {
      if (row.top_paper_1) uniquePapers.add(row.top_paper_1);
      if (row.top_paper_2) uniquePapers.add(row.top_paper_2);
      if (row.top_paper_3) uniquePapers.add(row.top_paper_3);
    });

    // Get deterministic daily stats
    const dailyStats = getDeterministicDailyStats();

    // Check for errors
    const errors = [
      { name: "papers", error: papersResult.error },
      { name: "models", error: modelsResult.error },
      { name: "paperSummaries", error: paperSummariesResult.error },
      { name: "modelSummaries", error: modelSummariesResult.error },
    ].filter((result) => result.error);

    if (errors.length > 0) {
      throw new Error(
        `Errors fetching stats: ${errors
          .map((e) => `${e.name}: ${e.error.message}`)
          .join(", ")}`
      );
    }

    res.status(200).json({
      weeklyPapersCount: (papersResult.count || 0) + (modelsResult.count || 0),
      weeklySummariesCount:
        (paperSummariesResult.count || 0) + (modelSummariesResult.count || 0),
      dailyReaders: dailyStats.dailyReaders,
      weeklySignups: dailyStats.dailyReaders,
      uniquePapersCount: uniquePapers.size,
    });
  } catch (error) {
    console.error("Error fetching overall stats:", error);
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
}
