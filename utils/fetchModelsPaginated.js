// utils/fetchModels.js
import supabase from "./supabaseClient";

export async function fetchModelsPaginated({
  tableName,
  pageSize,
  currentPage,
  searchValue,
  creator = null, // Add this line
}) {
  // Initialize a query object
  let query = supabase
    .from(tableName)
    .select(
      "id, lastUpdated, creator, modelName, description, tags, example, runs, costToRun, githubUrl, licenseUrl, paperUrl, predictionHardware, avgCompletionTime, platform, modelUrl, demoSources, generatedSummary, generatedUseCase",
      { count: "exact" }
    );

  // If a search value is provided, filter based on the modelName column using ilike operator
  if (searchValue) {
    query = query.ilike("modelName", `%${searchValue}%`);
  }

  // If a creator is provided, filter based on the creator column
  if (creator) {
    query = query.eq("creator", creator);
  }

  // Run the query
  const { data, error, count } = await query
    .order("runs", { ascending: false })
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

  if (error) {
    console.error(error);
    return { data: [], totalCount: 0 };
  }

  return { data, totalCount: count };
}
