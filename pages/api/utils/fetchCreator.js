import supabase from "./supabaseClient";

export async function fetchCreator({ viewName, creatorName }) {
  let query = supabase
    .from(viewName)
    .select("creator, example, id, platform")
    .eq("creator", creatorName);

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return { data: [] };
  }

  return { data };
}
