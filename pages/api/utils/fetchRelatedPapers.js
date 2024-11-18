// utils/fetchRelatedPapers.js
import supabase from "./supabaseClient";

const fetchRelatedPapers = async (
  paperEmbedding,
  similarityThreshold = 0.75,
  matchCount = 5
) => {
  const { data: relatedPapers, error } = await supabase.rpc("search_papers", {
    query_embedding: paperEmbedding,
    similarity_threshold: similarityThreshold,
    match_count: matchCount,
  });

  if (error) {
    console.error("Error fetching related papers:", error);
    return [];
  }

  return relatedPapers;
};

export default fetchRelatedPapers;
