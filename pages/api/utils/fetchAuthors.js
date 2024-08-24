import supabase from "./supabaseClient";

// utils/fetchAuthors.js
export async function fetchUniqueAuthors({
  platform,
  pageSize,
  currentPage,
  searchValue = null,
}) {
  let query = supabase
    .from(`unique_authors_data_view`)
    .select("*", { count: "exact" })
    .eq("platform", platform)
    .order("totalAuthorScore", { ascending: false })
    .limit(pageSize);

  if (searchValue) {
    query = query.ilike("author", `%${searchValue}%`);
  }

  const { data, error, count } = await query.range(
    (currentPage - 1) * pageSize,
    currentPage * pageSize - 1
  );

  if (error) {
    console.error(error);
    return { data: [], totalCount: 0 };
  }

  return { data, totalCount: count };
}

export async function fetchPapersByAuthor({
  platform,
  pageSize,
  currentPage,
  author,
}) {
  let query = supabase
    .from(`${platform}PapersData`)
    .select(
      "id, title, totalScore, arxivCategories, abstract, authors, paperUrl, pdfUrl, lastUpdated, indexedDate, publishedDate, arxivId, generatedSummary, thumbnail, slug, platform",
      { count: "exact" }
    )
    .contains("authors", [author])
    .limit(pageSize)
    .order("publishedDate", { ascending: false });

  const { data, error, count } = await query.range(
    (currentPage - 1) * pageSize,
    currentPage * pageSize - 1
  );

  if (error) {
    console.error(error);
    return { data: [], totalCount: 0 };
  }

  return { data, totalCount: count };
}
