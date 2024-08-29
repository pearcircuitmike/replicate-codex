import supabase from "./supabaseClient";

export async function fetchTrendingPapers(platform, startDate, limit = 5) {
  const endDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const { data, error } = await supabase
    .from(`${platform}PapersData`)
    .select("id, slug, totalScore, title, platform, thumbnail")
    .order("totalScore", { ascending: false })
    .lte("indexedDate", startDate.toISOString())
    .gte("indexedDate", endDate.toISOString())
    .limit(limit);

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function fetchTrendingModels(startDate, limit = 5) {
  const endDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const { data, error } = await supabase
    .from("modelsData")
    .select("id, slug, creator, modelName, totalScore, platform, example")
    .order("totalScore", { ascending: false })
    .lte("indexedDate", startDate.toISOString())
    .gte("indexedDate", endDate.toISOString())
    .limit(limit);

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function fetchTrendingCreators(startDate, limit = 5) {
  const { data, error } = await supabase
    .from("unique_creators_data_view")
    .select("creator, id, platform, totalCreatorScore")
    .order("totalCreatorScore", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function fetchTrendingAuthors(limit = 5) {
  const { data, error } = await supabase
    .from("unique_authors_data_view")
    .select("author, totalAuthorScore")
    .order("totalAuthorScore", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}
