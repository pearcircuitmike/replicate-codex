import { createClient } from "@supabase/supabase-js";
import { Configuration, OpenAIApi } from "openai";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize OpenAI client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Helper function to determine start date based on timeRange
function getStartDate(timeRange) {
  const now = new Date();
  switch (timeRange) {
    case "today":
      return new Date(now.setHours(0, 0, 0, 0)).toISOString();
    case "thisWeek":
      const firstDayOfWeek = new Date(
        now.setDate(now.getDate() - now.getDay())
      );
      return firstDayOfWeek.toISOString();
    case "thisMonth":
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    case "thisYear":
      return new Date(now.getFullYear(), 0, 1).toISOString();
    case "allTime":
    default:
      return "1970-01-01T00:00:00Z";
  }
}

// Create embedding using OpenAI
async function createEmbedding(query) {
  const embeddingResponse = await openai.createEmbedding({
    model: "text-embedding-ada-002", // Ensure the model is correct
    input: query,
  });
  const [{ embedding }] = embeddingResponse.data.data;
  return embedding;
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const {
        query = "",
        similarityThreshold = 0.7,
        matchCount = 20,
        timeRange = "allTime",
      } = req.body;

      const trimmedQuery = query ? query.trim() : "";
      const isEmptyQuery = trimmedQuery === "";

      // Determine the start date based on the time range
      const timeRangeStart = getStartDate(timeRange);

      let results = [];

      if (isEmptyQuery) {
        // Handle empty query: return all models within the time range
        const { data: modelsData, error: modelsError } = await supabase.rpc(
          "search_models",
          {
            query_embedding: null, // Indicate empty query
            similarity_threshold: similarityThreshold,
            match_count: matchCount,
            time_range_start: timeRangeStart,
          }
        );

        if (modelsError) throw modelsError;

        results = modelsData || [];
      } else {
        // Create embedding for the query
        const embedding = await createEmbedding(trimmedQuery);

        // Perform semantic search for models
        const { data: modelsData, error: modelsError } = await supabase.rpc(
          "search_models",
          {
            query_embedding: embedding,
            similarity_threshold: similarityThreshold,
            match_count: matchCount,
            time_range_start: timeRangeStart,
          }
        );

        if (modelsError) throw modelsError;

        results = modelsData || [];

        // If not enough matches, perform fuzzy search on model names and descriptions
        if (results.length < matchCount) {
          const remaining = matchCount - results.length;

          const { data: fuzzyModels, error: fuzzyError } = await supabase
            .from("modelsData")
            .select("*")
            .ilike("modelName", `%${trimmedQuery}%`)
            .or(`description.ilike.%${trimmedQuery}%`)
            .gte("lastUpdated", timeRangeStart)
            .order("totalScore", { ascending: false })
            .limit(remaining);

          if (fuzzyError) throw fuzzyError;

          // Filter out duplicates
          const uniqueFuzzyModels = fuzzyModels.filter(
            (fuzzy) => !results.some((model) => model.id === fuzzy.id)
          );

          results = [...results, ...uniqueFuzzyModels];
        }
      }

      return res.status(200).json({ data: results.slice(0, matchCount) });
    } catch (error) {
      console.error("Error in semantic search models:", {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        error: "An error occurred during the search. Please try again later.",
        details: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
