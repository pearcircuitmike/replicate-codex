import supabase from "./supabaseClient";

export async function fetchPapersPaginated({
  tableName,
  pageSize,
  currentPage,
  searchValue = null,
  selectedCategories = null,
  startDate = null,
  endDate = null,
}) {
  let query = supabase
    .from(tableName)
    .select(
      "id, title, arxivCategories, abstract, authors, paperUrl, pdfUrl, lastUpdated, indexedDate, publishedDate, arxivId, generatedSummary, generatedUseCase, thumbnail",
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
    .order("publishedDate", { ascending: false })
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

  if (error) {
    console.error(error);
    return { data: [], totalCount: 0 };
  }

  return { data, totalCount: count };
}

export const fetchPaperDataById = async (paperId) => {
  try {
    const { data, error } = await supabase
      .from("arxivPapersData")
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
