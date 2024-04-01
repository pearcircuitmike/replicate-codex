import supabase from "./supabaseClient";

// utils/fetchAuthors.js
export async function fetchUniqueAuthors({
  tableName,
  pageSize,
  currentPage,
  searchValue = null,
}) {
  let query = supabase
    .from(tableName)
    .select("authors", { count: "exact" })
    .limit(pageSize)
    .order("authors", { ascending: true });

  if (searchValue) {
    query = query.filter(`any(authors::text[] ilike '%${searchValue}%')`);
  }

  const { data, error, count } = await query.range(
    (currentPage - 1) * pageSize,
    currentPage * pageSize - 1
  );

  if (error) {
    console.error(error);
    return { data: [], totalCount: 0 };
  }

  const uniqueAuthors = Array.from(
    new Set(data.flatMap((item) => item.authors))
  );

  return { data: uniqueAuthors, totalCount: count };
}

export async function fetchPapersByAuthor({
  tableName,
  pageSize,
  currentPage,
  author,
}) {
  let query = supabase
    .from(tableName)
    .select(
      "id, title, arxivCategories, abstract, authors, paperUrl, pdfUrl, lastUpdated, indexedDate, publishedDate, arxivId, generatedSummary, generatedUseCase, thumbnail",
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
