import { createClient } from "@supabase/supabase-js";

// Connect to the Supabase database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_CLIENT_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Export the Supabase client instance
export default supabase;
