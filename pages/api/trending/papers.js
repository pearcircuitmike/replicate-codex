// pages/api/trending/papers.js

import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { platform, startDate, limit = 5 } = req.query;

  if (!platform) {
    return res.status(400).json({ error: "Missing platform parameter" });
  }

  let start;
  if (startDate) {
    start = new Date(startDate);
    if (isNaN(start)) {
      return res.status(400).json({ error: "Invalid startDate parameter" });
    }
  } else {
    start = new Date();
  }

  const endDate = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    console.log("Start Date:", start.toISOString());
    console.log("End Date:", endDate.toISOString());

    const { data, error } = await supabase
      .from(`${platform}PapersData`)
      .select(
        "id, slug, totalScore, title, platform, generatedSummary, thumbnail, authors"
      )
      .order("totalScore", { ascending: false })
      .lte("indexedDate", start.toISOString())
      .gte("indexedDate", endDate.toISOString())
      .limit(parseInt(limit, 10));

    if (error) {
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching trending papers:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
