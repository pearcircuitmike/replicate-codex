import supabase from "./supabaseClient";

const fetchRelatedModels = async (
  modelEmbedding,
  similarityThreshold = 0.75,
  matchCount = 5
) => {
  const { data: relatedModels, error } = await supabase.rpc("search_models", {
    query_embedding: modelEmbedding,
    similarity_threshold: similarityThreshold,
    match_count: matchCount,
    time_range_start: new Date("1970-01-01T00:00:00Z"), // Default to Unix epoch
  });

  if (error) {
    console.error("Error fetching related models:", error);
    return [];
  }

  return relatedModels;
};

export default fetchRelatedModels;
