import { createClient } from "@supabase/supabase-js";

// Connect to the Supabase database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_CLIENT_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Utility function to fetch data from a specific table
export async function fetchDataFromTable(tableName) {
  // Query the specified table for data
  const { data, error } = await supabase.from(tableName).select("*");

  // Handle any errors
  if (error) {
    console.error(error);
    return null;
  }

  // Return the data
  return data;
}

export async function fetchModelDataById(id) {
  const { data, error } = await supabase
    .from("modelsData")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching model data:", error);
    return null;
  }

  return data;
}

// utils/supabaseClient.js
export async function fetchRunsHistoryByModelId(modelId) {
  const { data, error } = await supabase
    .from("runsHistory")
    .select("*")
    .eq("model_id", modelId)
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Error fetching runs history:", error);
    return [];
  }

  return data;
}

export async function fetchFilteredData({
  tableName,
  tags = [],
  searchValue = "",
  sorts = [],
  pageSize = 10,
  currentPage = 1,
}) {
  let query = supabase.from(tableName).select("*", { count: "exact" });

  if (tags.length > 0) {
    query = query.or(tags.map((tag) => `tags.contains.${tag}`).join(","));
  }

  if (searchValue) {
    query = query.ilike("name", `%${searchValue}%`);
  }

  sorts.forEach(({ field, direction }) => {
    query = query.order(field, { ascending: direction === "asc" });
  });

  const { count } = await query;

  const offset = (currentPage - 1) * pageSize;
  query = query.range(offset, offset + pageSize - 1);

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return { data: null, totalCount: 0 };
  }

  return { data, totalCount: count };
}
export async function fetchAllTags() {
  const { data, error } = await supabase.from("modelsData").select("tags");

  if (error) {
    console.error("Error fetching all tags:", error);
    return [];
  }

  const allTags = data.flatMap((item) => item.tags);
  return Array.from(new Set(allTags));
}
// Export the Supabase client instance
export default supabase;
