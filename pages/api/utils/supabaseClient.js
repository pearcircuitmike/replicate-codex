import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

//console.log("Supabase URL:", supabaseUrl);
//console.log("Supabase Anon Key:", supabaseAnonKey ? "[REDACTED]" : "undefined");

let supabase;

if (typeof window === "undefined") {
  // Server-side
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // console.log("Server Supabase Key:", supabaseKey ? "[REDACTED]" : "undefined");
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  // Client-side
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export default supabase;

// For explicit server-side usage
export const getServerSupabase = () => {
  if (typeof window !== "undefined") {
    throw new Error(
      "getServerSupabase should only be called on the server side"
    );
  }
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(supabaseUrl, supabaseKey);
};
