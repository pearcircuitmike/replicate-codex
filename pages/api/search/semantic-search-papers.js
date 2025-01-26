import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Helper function to determine the start date based on the timeRange.
 * @param {string} timeRange - The selected time range.
 * @returns {string} - ISO string of the start date.
 */
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

/**
 * Function to create an embedding for the given query using OpenAI.
 * @param {string} query - The search query.
 * @param {AbortSignal} signal - The abort signal to cancel the request if needed.
 * @returns {Array} - The embedding vector.
 */
async function createEmbedding(query, signal) {
  const response = await openai.embeddings.create(
    {
      model: "text-embedding-ada-002",
      input: query,
    },
    { signal }
  );
  const [{ embedding }] = response.data;
  return embedding;
}

/**
 * API Route Handler for searching papers.
 * Supports semantic and fuzzy search with cancellation feature.
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    // Initialize AbortController to handle cancellation
    const controller = new AbortController();
    const { signal } = controller;

    // Listen for client disconnects to abort ongoing operations
    req.on("aborted", () => {
      console.log("Request aborted by the client.");
      controller.abort();
    });

    try {
      const {
        query = "",
        similarityThreshold = 0.7,
        matchCount = 10,
        timeRange = "allTime",
      } = req.body;

      console.log("Received request body:", req.body);

      const trimmedQuery = query ? query.trim() : "";
      const isEmptyQuery = trimmedQuery === "";

      // Determine the start date based on the time range
      const timeRangeStart = getStartDate(timeRange);
      console.log("Time range start:", timeRangeStart);

      let results = [];

      if (isEmptyQuery) {
        console.log("Handling empty query case");

        // Perform RPC call to Supabase function 'search_papers' with null embedding
        const { data: papersData, error: papersError } = await supabase.rpc(
          "search_papers",
          {
            query_embedding: null,
            similarity_threshold: similarityThreshold,
            match_count: matchCount,
            time_range_start: timeRangeStart,
          }
        );

        if (papersError) {
          console.error("Error in empty query search:", papersError);
          throw papersError;
        }

        results = papersData || [];
      } else {
        console.log("Handling non-empty query case");

        // Create embedding for the trimmed query with cancellation support
        const embedding = await createEmbedding(trimmedQuery, signal);
        console.log("Created embedding for query");

        // Perform semantic search using the embedding
        const { data: papersData, error: papersError } = await supabase.rpc(
          "search_papers",
          {
            query_embedding: embedding,
            similarity_threshold: similarityThreshold,
            match_count: matchCount,
            time_range_start: timeRangeStart,
          }
        );

        if (papersError) {
          console.error("Error in semantic search:", papersError);
          throw papersError;
        }

        results = papersData || [];
        console.log("Semantic search results:", results.length);

        // If not enough results, perform fuzzy search
        if (results.length < matchCount) {
          const remaining = matchCount - results.length;

          const { data: fuzzyPapers, error: fuzzyError } = await supabase
            .from("arxivPapersData")
            .select("*")
            .or(`arxivId.ilike.%${trimmedQuery}%,title.ilike.%${trimmedQuery}%`)
            .gte("publishedDate", timeRangeStart)
            .order("totalScore", { ascending: false })
            .limit(remaining);

          if (fuzzyError) {
            console.error("Error in fuzzy search:", fuzzyError);
            throw fuzzyError;
          }

          // Filter out duplicates
          const uniqueFuzzyPapers = fuzzyPapers.filter(
            (fuzzy) => !results.some((paper) => paper.id === fuzzy.id)
          );

          results = [...results, ...uniqueFuzzyPapers];
          console.log("After fuzzy search, total results:", results.length);
        }
      }

      console.log("Returning results:", results.length);
      return res.status(200).json({ data: results.slice(0, matchCount) });
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Search operation was aborted.");
        return res.status(499).json({
          error: "Client closed the request before completion.",
        });
      }

      console.error("Error in semantic search papers:", error);
      return res.status(500).json({
        error: "An error occurred during the search. Please try again later.",
        details: error.message,
      });
    }
  } else {
    // Method not allowed
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
