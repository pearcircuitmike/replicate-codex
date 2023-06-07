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
    .select("creator, example, total_runs, id, rank, platform", {
      count: "exact",
    });

  if (searchValue) {
    query = query.ilike("creator", `%${searchValue}%`);
  }

  const { data, error, count } = await query
    .order("rank", { ascending: true })
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

  if (error) {
    console.error(error);
    return { data: [], totalCount: 0 };
  }

  return { data, totalCount: count };
}
