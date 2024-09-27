// pages/api/trending/authors.js

import supabase from "../utils/supabaseClient";
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { limit = 5 } = req.query;

  try {
    const { data, error } = await supabase
      .from("unique_authors_data_view")
      .select("author, totalAuthorScore")
      .order("totalAuthorScore", { ascending: false })
      .limit(parseInt(limit, 10));

    if (error) {
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching trending authors:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
