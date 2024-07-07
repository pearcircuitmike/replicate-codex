import supabase from "./supabaseClient";

export async function fetchModelsByCreator({
  tableName,
  pageSize,
  currentPage,
  creator,
  searchValue = null,
  selectedCategories = null,
  startDate = null,
  endDate = null,
}) {
  let query = supabase
    .from(tableName)
    .select(
      "id, lastUpdated, slug, creator, modelName, description, tags, example, totalScore, githubUrl, licenseUrl, paperUrl, platform, modelUrl, generatedSummary",
      { count: "exact" }
    )
    .eq("creator", creator);

  if (searchValue) {
    query = query.ilike("modelName", `%${searchValue}%`);
  }

  if (selectedCategories) {
    query = query.in("tags", selectedCategories);
  }

  if (startDate && endDate) {
    query = query
      .gte("lastUpdated", startDate.toISOString())
      .lte("lastUpdated", endDate.toISOString());
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
