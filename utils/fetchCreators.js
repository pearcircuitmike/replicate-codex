// utils/fetchCreators.js
import supabase from "./supabaseClient";

export async function fetchCreators({
  viewName,
  pageSize,
  currentPage,
  searchValue,
}) {
  let query = supabase
    .from(viewName)
    .select("creator, example, total_runs, id, rank", { count: "exact" });

  if (searchValue) {
    query = query.ilike("creator", `%${searchValue}%`);
  }

  const { data, error, count } = await query
    .order("total_runs", { ascending: false })
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

  if (error) {
    console.error(error);
    return { data: [], totalCount: 0 };
  }

  return { data, totalCount: count };
}
