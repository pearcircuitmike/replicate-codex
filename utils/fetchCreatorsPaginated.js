// utils/fetchCreators.js
import supabase from "./supabaseClient";

export async function fetchCreators({
  tableName,
  pageSize,
  currentPage,
  searchValue,
  creatorName = null,
  platform = null,
}) {
  let query = supabase
    .from(tableName)
    .select("creator, example,  id, platform", {
      count: "exact",
    });

  if (searchValue) {
    query = query.ilike("creator", `%${searchValue}%`);
  }

  if (creatorName) {
    query = query.eq("creator", creatorName);
  }

  if (platform) {
    query = query.eq("platform", platform);
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
