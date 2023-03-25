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

// Export the Supabase client instance
export default supabase;
