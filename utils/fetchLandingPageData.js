// utils/fetchLandingPageData.js
import supabase from "./supabaseClient";

export async function fetchTrendingModels(limit = 5) {
  const currentDate = new Date();
  const startDate = new Date();
  startDate.setDate(currentDate.getDate() - 7);
  const endDate = new Date();
  endDate.setDate(currentDate.getDate());

  let query = supabase
    .from("modelsData")
    .select(
      "id, indexedDate, slug, creator, modelName, description, tags, example, totalScore, githubUrl, licenseUrl, paperUrl, platform, modelUrl, generatedSummary"
    )
    .order("totalScore", { ascending: false })
    .gte("indexedDate", startDate.toISOString())
    .lte("indexedDate", endDate.toISOString())
    .limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function fetchTrendingPapers(platform, limit = 5) {
  const currentDate = new Date();
  const startDate = new Date();
  startDate.setDate(currentDate.getDate() - 7);
  const endDate = new Date();
  endDate.setDate(currentDate.getDate());

  let query = supabase
    .from(`${platform}PapersData`)
    .select(
      "id, slug, totalScore, redditScore, hackerNewsScore, title, arxivCategories, abstract, authors, paperUrl, pdfUrl, lastUpdated, indexedDate, publishedDate, arxivId, generatedSummary, thumbnail, platform"
    )
    .order("totalScore", { ascending: false })
    .gte("indexedDate", startDate.toISOString())
    .lte("indexedDate", endDate.toISOString())
    .limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function fetchTrendingCreators(limit = 5) {
  const currentDate = new Date();
  const startDate = new Date();
  const endDate = new Date();

  let query = supabase
    .from("unique_creators_data_view")
    .select("creator, example, id, platform, totalCreatorScore, creatorRank")
    .order("totalCreatorScore", { ascending: false })
    // there's no indexDate in this table currently, need to add
    .limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function fetchTrendingAuthors(platform, limit = 5) {
  const currentDate = new Date();
  const startDate = new Date();
  startDate.setDate(currentDate.getDate() - 17);
  const endDate = new Date();
  endDate.setDate(currentDate.getDate() - 14);

  // this needs to be fixed
  let query = supabase
    .from(`${platform}PapersData`)
    .select("authors, totalScore")
    .order("totalScore", { ascending: false })
    .gte("lastUpdated", startDate.toISOString())
    .lte("lastUpdated", endDate.toISOString())
    .limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }
  const trendingAuthors = Array.from(
    new Set(data.flatMap((item) => item.authors))
  ).slice(0, limit);
  return trendingAuthors;
}
