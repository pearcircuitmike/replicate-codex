// utils/fetchRelatedModels.js
import supabase from "./supabaseClient";

const fetchRelatedModels = async (
  modelEmbedding,
  similarityThreshold = 0.75,
  matchCount = 4
) => {
  const { data: relatedModels, error } = await supabase.rpc(
    "find_related_models",
    {
      query_embedding: modelEmbedding,
      similarity_threshold: similarityThreshold,
      match_count: matchCount,
    }
  );

  if (error) {
    console.error("Error fetching related models:", error);
    return [];
  }

  return relatedModels;
};

export default fetchRelatedModels;
