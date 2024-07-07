// utils/fetchTrendingPapers.js
import supabase from "./supabaseClient";

export const fetchTrendingPapers = async (platform, startDate) => {
  try {
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from(`${platform}PapersData`)
      .select("*")
      .order("totalScore", { ascending: false })
      .gte("publishedDate", startDate.toISOString())
      .lt("publishedDate", endDate.toISOString())
      .limit(10);

    if (error) {
      console.error("Error fetching trending papers:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error fetching trending papers:", error);
    return [];
  }
};
