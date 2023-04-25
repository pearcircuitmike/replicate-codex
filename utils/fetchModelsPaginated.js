// utils/fetchModels.js
import supabase from "./supabaseClient";

export async function fetchModelsPaginated({
  tableName,
  pageSize,
  currentPage,
  searchValue,
}) {
  // Filter based on the modelName column using ilike operator
  const { data, error, count } = await supabase
    .from(tableName)
    .select("*", { count: "exact" })
    .ilike("modelName", `%${searchValue}%`)
    .order("id")
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

  if (error) {
    console.error(error);
    return { data: [], totalCount: 0 };
  }

  return { data, totalCount: count };
}
