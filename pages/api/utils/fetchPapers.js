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
      "id, slug, totalScore, redditScore, hackerNewsScore, title, arxivCategories, abstract, authors, paperUrl, pdfUrl, lastUpdated, indexedDate, publishedDate, arxivId, generatedSummary, thumbnail, platform",
      { count: "exact" }
    );

  if (searchValue) {
    query = query.or(
      `title.ilike.%${searchValue}%,arxivId.ilike.%${searchValue}%`
    );
  }

  if (selectedCategories) {
    query = query.overlaps("arxivCategories", selectedCategories);
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
      .from(`${platform}PapersData`) // e.g. "arxivPapersData"
      .select(
        `
        id,
        slug,
        totalScore,
        redditScore,
        hackerNewsScore,
        title,
        "arxivCategories",
        abstract,
        authors,
        "paperUrl",
        "pdfUrl",
        "lastUpdated",
        "indexedDate",
        "publishedDate",
        "arxivId",
        "generatedSummary",
        thumbnail,
        platform,
        task_ids
      `
      )
      .eq("slug", paperSlug)
      .eq("platform", platform)
      .single();

    if (error) {
      console.error("Error fetching paper data by slug:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching paper data by slug (try-catch):", error);
    return null;
  }
};

export const fetchAdjacentPapers = async (slug, platform) => {
  try {
    const { data: currentPaper, error: currentPaperError } = await supabase
      .from(`${platform}PapersData`)
      .select("publishedDate")
      .eq("slug", slug)
      .single();

    if (currentPaperError) {
      console.error("Error fetching current paper:", currentPaperError);
      return { prevSlug: null, nextSlug: null };
    }

    console.log("Current paper:", currentPaper);

    const { data: prevPaper, error: prevPaperError } = await supabase
      .from(`${platform}PapersData`)
      .select("slug")
      .order("publishedDate", { ascending: false })
      .lt("publishedDate", currentPaper.publishedDate)
      .limit(1)
      .single();

    const { data: nextPaper, error: nextPaperError } = await supabase
      .from(`${platform}PapersData`)
      .select("slug")
      .order("publishedDate", { ascending: true })
      .gt("publishedDate", currentPaper.publishedDate)
      .limit(1)
      .single();

    if (prevPaperError && prevPaperError.code === "PGRST116") {
      console.warn("No previous paper found");
      return { prevSlug: null, nextSlug: nextPaper ? nextPaper.slug : null };
    }

    if (nextPaperError && nextPaperError.code === "PGRST116") {
      console.warn("No next paper found");
      return { prevSlug: prevPaper ? prevPaper.slug : null, nextSlug: null };
    }

    if (prevPaperError || nextPaperError) {
      console.error(
        "Error fetching adjacent papers:",
        prevPaperError || nextPaperError
      );
      return { prevSlug: null, nextSlug: null };
    }

    console.log("Previous paper:", prevPaper);
    console.log("Next paper:", nextPaper);

    const prevSlug = prevPaper ? prevPaper.slug : null;
    const nextSlug = nextPaper ? nextPaper.slug : null;

    return { prevSlug, nextSlug };
  } catch (error) {
    console.error("Error fetching adjacent papers:", error);
    return { prevSlug: null, nextSlug: null };
  }
};
