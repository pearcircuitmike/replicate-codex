// utils/fetchTools.js
import supabase from "./supabaseClient";

export async function fetchToolsPaginated({
  pageSize,
  currentPage,
  searchValue = null,
  selectedCategory = null,
}) {
  let query = supabase
    .from("toolsData")
    .select("*", { count: "exact" })
    .eq("isApproved", true);

  if (searchValue) {
    query = query.or(
      `toolName.ilike.%${searchValue}%,description.ilike.%${searchValue}%`
    );
  }

  if (selectedCategory && selectedCategory !== "All") {
    query = query.eq("categories", selectedCategory);
  }

  const { data, error, count } = await query
    .order("indexedDate", { ascending: false })
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

  if (error) {
    console.error(error);
    return { data: [], totalCount: 0 };
  }

  return { data, totalCount: count };
}

export const fetchToolDataBySlug = async (toolSlug) => {
  try {
    const { data, error } = await supabase
      .from("toolsData")
      .select("*")
      .eq("slug", toolSlug)
      .eq("isApproved", true)
      .single();

    if (error) {
      console.error("Error fetching tool data:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching tool data:", error);
    return null;
  }
};
