// utils/fetchPapers.js
import supabase from "./supabaseClient";

export async function fetchPapersPaginated({
  platform,
  pageSize,
  currentPage,
  searchValue = null,
  selectedCategories = null,
  startDate = null,
  endDate = null,
}) {
  let query = supabase
    .from(`${platform}PapersData`)
    .select(
      "id, slug, totalScore, redditScore, hackerNewsScore, title, arxivCategories, abstract, authors, paperUrl, pdfUrl, lastUpdated, indexedDate, publishedDate, arxivId, generatedSummary, generatedUseCase, thumbnail, platform",
      { count: "exact" }
    );

  if (searchValue) {
    query = query.or(
      `title.ilike.%${searchValue}%,arxivId.ilike.%${searchValue}%`
    );
  }

  if (selectedCategories) {
    query = query.containedBy("arxivCategories", selectedCategories);
  }

  if (startDate && endDate) {
    query = query
      .gte("publishedDate", startDate.toISOString())
      .lte("publishedDate", endDate.toISOString());
  }

  const { data, error, count } = await query
    .order("totalScore", { ascending: false }) // Sort by totalScore in descending order
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

  if (error) {
    console.error(error);
    return { data: [], totalCount: 0 };
  }

  return { data, totalCount: count };
}

export const fetchPaperDataById = async (paperId, platform) => {
  try {
    const { data, error } = await supabase
      .from(`${platform}PapersData`)
      .select("*")
      .eq("id", paperId)
      .single();

    if (error) {
      console.error("Error fetching paper data:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching paper data:", error);
    return null;
  }
};

export const fetchPaperDataBySlug = async (paperSlug, platform) => {
  try {
    const { data, error } = await supabase
      .from(`${platform}PapersData`)
      .select("*")
      .eq("slug", paperSlug)
      .single();

    if (error) {
      console.error("Error fetching paper data:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching paper data:", error);
    return null;
  }
};
