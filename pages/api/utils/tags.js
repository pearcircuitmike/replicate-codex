import supabase from "./supabaseClient";

export async function fetchAllTags(tableName) {
  const { data, error } = await supabase.from(tableName).select("tags");

  if (error) {
    console.error("Error fetching all tags:", error);
    return [];
  }

  const allTags = data.flatMap((item) => item.tags);
  return Array.from(new Set(allTags));
}
