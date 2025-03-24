// pages/api/chat/lib/retriever.js

import supabase from "@/pages/api/utils/supabaseClient";

/**
 * Get embedding for a text string
 * Uses direct fetch to OpenAI API
 */
async function getEmbedding(text) {
  console.log("======= EMBEDDING GENERATION START =======");
  console.log(
    `Input text (${text.length} chars): "${text.substring(0, 100)}..."`
  );

  // Check for API key
  const apiKey = process.env.OPENAI_API_KEY;
  console.log(`API key exists: ${!!apiKey}, Length: ${apiKey?.length || 0}`);

  if (!apiKey) {
    console.error("CRITICAL ERROR: Missing OpenAI API key");
    throw new Error("Missing OpenAI API key");
  }

  try {
    console.log("Making OpenAI API request...");
    const requestBody = JSON.stringify({
      model: "text-embedding-ada-002", // USING ADA-002 MODEL THAT WORKS
      input: text,
    });
    console.log("Request body length:", requestBody.length);

    const startTime = Date.now();
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: requestBody,
    });
    const endTime = Date.now();
    console.log(`OpenAI API response time: ${endTime - startTime}ms`);
    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("=== OPENAI API ERROR RESPONSE ===");
      console.error(`Status: ${response.status}, Response: ${errorData}`);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log("Response structure:", Object.keys(result));
    console.log("Data array length:", result.data?.length || 0);

    if (!result.data || !result.data[0] || !result.data[0].embedding) {
      console.error(
        "Malformed embedding response:",
        JSON.stringify(result).substring(0, 500)
      );
      throw new Error("Malformed embedding response from OpenAI");
    }

    const embedding = result.data[0].embedding;
    console.log("Embedding vector generated successfully");
    console.log(`Vector dimensions: ${embedding.length}`);
    console.log("First 5 values:", embedding.slice(0, 5));
    console.log("======= EMBEDDING GENERATION COMPLETE =======");

    return embedding;
  } catch (error) {
    console.error("======= EMBEDDING GENERATION FAILED =======");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    throw error;
  }
}

/**
 * Debug a Supabase RPC call response
 */
function debugRpcResponse(name, data, error) {
  console.log(`===== ${name} RPC RESPONSE =====`);
  if (error) {
    console.error(`${name} error code:`, error.code);
    console.error(`${name} error message:`, error.message);
    console.error(`${name} error details:`, error.details);
    console.error(`${name} error hint:`, error.hint);
    return false;
  }

  console.log(`${name} response type:`, typeof data);
  console.log(`${name} is array:`, Array.isArray(data));
  console.log(`${name} data length:`, data?.length || 0);

  if (data && Array.isArray(data) && data.length > 0) {
    console.log(`${name} first item keys:`, Object.keys(data[0]));
    console.log(
      `${name} sample item:`,
      JSON.stringify(data[0]).substring(0, 300) + "..."
    );
    return true;
  } else {
    console.log(`${name} returned no results`);
    return false;
  }
}

/**
 * Check Supabase connection
 */
async function checkSupabaseConnection() {
  try {
    console.log("Testing Supabase connection...");
    console.log("Supabase client:", typeof supabase);
    console.log("Supabase methods:", Object.keys(supabase));

    // Try a simple query
    const { data, error } = await supabase
      .from("modelsData")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Supabase connection test error:", error);
      return false;
    }

    console.log("Supabase connection test result:", data);
    return true;
  } catch (error) {
    console.error("Supabase connection check failed:", error);
    return false;
  }
}

/**
 * Retrieve relevant context from vector database based on user query
 */
export async function getRelevantContext(query, maxResults = 5) {
  console.log("\n\n======= GET RELEVANT CONTEXT START =======");
  console.log(`Query: "${query}"`);
  console.log(`Max results: ${maxResults}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  try {
    // Test Supabase connection first
    const connectionOk = await checkSupabaseConnection();
    console.log(
      "Supabase connection check:",
      connectionOk ? "SUCCESS" : "FAILED"
    );

    if (!connectionOk) {
      console.error("Cannot continue with RAG due to connection issues");
      return { papers: [], models: [] };
    }

    // Generate embedding for the query
    console.log("Generating embedding...");
    let embedding;
    try {
      embedding = await getEmbedding(query);
      console.log("Embedding generated successfully");
    } catch (embeddingError) {
      console.error(
        "Could not generate embedding, aborting search:",
        embeddingError
      );
      return { papers: [], models: [] };
    }

    // Set time range for models (last 4 years)
    const fourYearsAgo = new Date();
    fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);
    console.log(`Time range start: ${fourYearsAgo.toISOString()}`);

    // Split maxResults for papers and models
    const papersLimit = Math.ceil(maxResults * 0.6);
    const modelsLimit = maxResults - papersLimit;
    console.log(`Papers limit: ${papersLimit}, Models limit: ${modelsLimit}`);

    // Initialize results containers
    let papers = [];
    let models = [];

    // Search for papers with vector similarity using RPC
    console.log("\n----- SEARCHING PAPERS -----");
    console.log("RPC name: search_papers");
    console.log("Similarity threshold: 0.3"); // LOWERED THRESHOLD
    console.log("Match count:", papersLimit);
    console.log("Embedding vector length:", embedding.length);

    try {
      console.log("Executing papers search RPC...");
      const papersStartTime = Date.now();
      const papersResponse = await supabase.rpc("search_papers", {
        query_embedding: embedding,
        similarity_threshold: 0.3, // LOWERED THRESHOLD
        match_count: papersLimit,
        // REMOVED time_range_start parameter - not in function definition
      });
      const papersEndTime = Date.now();
      console.log(
        `Papers search execution time: ${papersEndTime - papersStartTime}ms`
      );

      const { data: papersData, error: papersError } = papersResponse;
      const papersSuccess = debugRpcResponse("Papers", papersData, papersError);

      if (papersSuccess) {
        papers = papersData;
      } else {
        console.log("Will use empty papers array due to error or no results");
      }
    } catch (papersSearchError) {
      console.error("Exception during papers search:", papersSearchError);
    }

    // Search for models with vector similarity using RPC
    console.log("\n----- SEARCHING MODELS -----");
    console.log("RPC name: search_models");
    console.log("Similarity threshold: 0.3"); // LOWERED THRESHOLD
    console.log("Match count:", modelsLimit);
    console.log("Time range start:", fourYearsAgo.toISOString());

    try {
      console.log("Executing models search RPC...");
      const modelsStartTime = Date.now();
      const modelsResponse = await supabase.rpc("search_models", {
        query_embedding: embedding,
        similarity_threshold: 0.3, // LOWERED THRESHOLD
        match_count: modelsLimit,
        time_range_start: fourYearsAgo.toISOString(),
      });
      const modelsEndTime = Date.now();
      console.log(
        `Models search execution time: ${modelsEndTime - modelsStartTime}ms`
      );

      const { data: modelsData, error: modelsError } = modelsResponse;
      const modelsSuccess = debugRpcResponse("Models", modelsData, modelsError);

      if (modelsSuccess) {
        models = modelsData;
      } else {
        console.log("Will use empty models array due to error or no results");
      }
    } catch (modelsSearchError) {
      console.error("Exception during models search:", modelsSearchError);
    }

    // Combine results
    const results = {
      papers: papers || [],
      models: models || [],
    };

    console.log("\n----- RESULTS SUMMARY -----");
    console.log("Papers count:", results.papers.length);
    console.log("Models count:", results.models.length);
    console.log(
      "Total results:",
      results.papers.length + results.models.length
    );

    if (results.papers.length === 0 && results.models.length === 0) {
      console.log("WARNING: No results found in either papers or models!");
    }

    console.log("======= GET RELEVANT CONTEXT COMPLETE =======\n\n");
    return results;
  } catch (error) {
    console.error("======= GET RELEVANT CONTEXT FAILED =======");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return { papers: [], models: [] };
  }
}

// For debugging: Try a direct query to verify RPC function existence
export async function verifyRpcFunctions() {
  console.log("Verifying RPC functions existence...");

  try {
    // Check if function exists in database
    const { data: functions, error } = await supabase
      .from("pg_proc")
      .select("proname")
      .filter("proname", "in", "(search_papers,search_models)");

    if (error) {
      console.error("Error checking functions:", error);
    } else {
      console.log("Found functions:", functions);
    }
  } catch (e) {
    console.error("Function verification failed:", e);
  }

  return "Verification complete, check logs";
}
