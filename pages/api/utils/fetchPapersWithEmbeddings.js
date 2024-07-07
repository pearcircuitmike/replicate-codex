// utils/fetchPapersWithEmbeddings.js
import supabase from "./supabaseClient";

export const fetchPapersWithEmbeddings = async (
  embedding,
  similarityThreshold = 0.75,
  matchCount = 10,
  selectedCategories = null
) => {
  let query = supabase.rpc("search_papers", {
    query_embedding: embedding,
    similarity_threshold: similarityThreshold,
    match_count: matchCount,
  });

  if (selectedCategories) {
    query = query.containedBy("arxivCategories", selectedCategories);
  }

  const {
    data: papers,
    error,
    count,
  } = await query.select("*", {
    count: "exact",
  });

  if (error) {
    console.error("Error fetching papers with embeddings:", error);
    return { papers: [], totalCount: 0 };
  }

  return { papers, totalCount: count };
};
