import supabase from "./supabaseClient";

export async function fetchTopModelIds(
  limit,
  selectedTags,
  selectedPlatforms = []
) {
  try {
    let query = supabase.from("combinedModelsData").select("id");

    // Filtering by platform, if needed
    if (selectedPlatforms && selectedPlatforms.length > 0) {
      query = query.in("platform", selectedPlatforms);
    }

    // Filter out models with null runs
    query = query.not("runs", "is", null);

    // Order the results by runs and limit the results
    query = query.order("runs", { ascending: false }).limit(limit);

    if (selectedTags && selectedTags.length > 0) {
      selectedTags.forEach((tag) => {
        query = query.ilike("tags", `%${tag}%`);
      });
    }

    const { data, error } = await query;
    console.log(data);

    if (error) {
      console.error("Error fetching top model ids:", error);
      throw new Error(error.message);
    }

    return data.map((item) => item.id);
  } catch (error) {
    console.error("Error fetching top model ids:", error);
    throw new Error(error.message);
  }
}
