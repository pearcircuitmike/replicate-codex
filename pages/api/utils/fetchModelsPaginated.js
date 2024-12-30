import supabase from "./supabaseClient";

export async function fetchModelsPaginated({
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
      "id, lastUpdated, slug, creator, modelName, description, tags, example, totalScore, githubUrl, licenseUrl, paperUrl, platform, modelUrl, generatedSummary, indexedDate",
      { count: "exact" }
    );

  if (searchValue) {
    query = query.ilike("modelName", `%${searchValue}%`);
  }

  if (selectedCategories) {
    query = query.in("tags", selectedCategories);
  }

  if (startDate && endDate) {
    query = query
      .gte("indexedDate", startDate.toISOString())
      .lte("indexedDate", endDate.toISOString());
  }

  const { data, error, count } = await query
    .order("totalScore", { ascending: false })
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

  if (error) {
    console.error(error);
    return { data: [], totalCount: 0 };
  }

  return { data, totalCount: count };
}
