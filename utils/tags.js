import supabase from "./supabaseClient";

export async function fetchAllTags() {
  const { data, error } = await supabase.from("modelsData").select("tags");

  if (error) {
    console.error("Error fetching all tags:", error);
    return [];
  }

  const allTags = data.flatMap((item) => item.tags);
  return Array.from(new Set(allTags));
}
