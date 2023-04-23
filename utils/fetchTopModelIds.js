import supabase from "./supabaseClient";

export async function fetchTopModelIds(limit, selectedTags) {
  try {
    let query = supabase
      .from("modelsData")
      .select("id")
      .order("runs", { ascending: false })
      .limit(limit);

    if (selectedTags && selectedTags.length > 0) {
      selectedTags.forEach((tag) => {
        query = query.ilike("tags", `%${tag}%`);
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching top model ids:", error);
      return [];
    }

    return data.map((item) => item.id);
  } catch (error) {
    console.error("Error fetching top model ids:", error);
    return [];
  }
}
