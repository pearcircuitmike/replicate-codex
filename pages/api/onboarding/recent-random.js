// pages/api/onboarding/recent-random.js
import supabase from "@/pages/api/utils/supabaseClient";

/**
 * Fetch up to 'limit' random papers from the last 'days' days
 * by 'indexedDate'.
 * We fetch up to 50 recent ones, then shuffle in JS and return 'limit'.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { limit: limitParam = 3, days: daysParam = 7 } = req.query;

  const limit = parseInt(limitParam, 10) || 3;
  const days = parseInt(daysParam, 10) || 7;

  try {
    // Cutoff date by indexedDate
    const cutoffDate = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString();

    // Fetch up to 50 papers from the last 'days' days, sorted by indexedDate DESC
    const { data, error } = await supabase
      .from("arxivPapersData") // Change if your table name is different
      .select("*")
      .gte("indexedDate", cutoffDate)
      .order("indexedDate", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching recent papers:", error);
      return res.status(500).json({ error: "Failed to fetch recent papers" });
    }

    if (!data || data.length === 0) {
      return res.status(200).json({ papers: [] });
    }

    // Shuffle the array in JS
    const shuffled = data.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, limit);

    return res.status(200).json({ papers: selected });
  } catch (err) {
    console.error("Error in /api/onboarding/recent-random:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
