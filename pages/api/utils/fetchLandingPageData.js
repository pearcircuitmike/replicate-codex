// utils/fetchLandingPageData.js
import supabase from "./supabaseClient";

export async function fetchTrendingPapers(platform, startDate, limit = 5) {
  const endDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  let query = supabase
    .from(`${platform}PapersData`)
    .select(
      "id, slug, totalScore, redditScore, hackerNewsScore, title, arxivCategories, abstract, authors, paperUrl, pdfUrl, lastUpdated, indexedDate, publishedDate, arxivId, generatedSummary, thumbnail, platform"
    )
    .order("totalScore", { ascending: false })
    .lte("indexedDate", startDate.toISOString())
    .gte("indexedDate", endDate.toISOString())
    .limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function fetchTrendingModels(startDate, limit = 5) {
  const endDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  let query = supabase
    .from("modelsData")
    .select(
      "id, indexedDate, slug, creator, modelName, description, tags, example, totalScore, githubUrl, licenseUrl, paperUrl, platform, modelUrl, generatedSummary"
    )
    .order("totalScore", { ascending: false })
    .lte("indexedDate", startDate.toISOString())
    .gte("indexedDate", endDate.toISOString())
    .limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function fetchTrendingCreators(startDate, limit = 5) {
  const endDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  let query = supabase
    .from("unique_creators_data_view")
    .select("creator, example, id, platform, totalCreatorScore, creatorRank")
    .order("totalCreatorScore", { ascending: false })
    .limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function fetchTrendingAuthors(limit = 5) {
  // Query the unique_authors_data_view view
  let query = supabase
    .from("unique_authors_data_view")
    .select("author, totalAuthorScore")
    .order("totalAuthorScore", { ascending: false })
    .limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }

  const trendingAuthors = data.map((item) => item.author).slice(0, limit);
  return trendingAuthors;
}
