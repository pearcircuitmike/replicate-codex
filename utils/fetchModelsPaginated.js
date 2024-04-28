import supabase from "./supabaseClient";

export async function fetchModelsPaginated({
  tableName,
  pageSize,
  currentPage,
  searchValue,
  creator = null,
}) {
  let query = supabase
    .from(tableName)
    .select(
      "id, lastUpdated, slug, creator, modelName, description, tags, example, runs, githubUrl, licenseUrl, paperUrl, platform, modelUrl, generatedSummary",
      { count: "exact" }
    );

  if (searchValue) {
    query = query.ilike("modelName", `%${searchValue}%`);
  }

  if (creator) {
    query = query.eq("creator", creator);
  }

  const { data, error, count } = await query
    .order("runs", { ascending: false })
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

  if (error) {
    console.error(error);
    return { data: [], totalCount: 0 };
  }

  return { data, totalCount: count };
}
