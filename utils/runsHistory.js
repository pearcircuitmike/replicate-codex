import supabase from "./supabaseClient";

export async function fetchRunsHistoryByModelId(modelId) {
  const { data, error } = await supabase
    .from("runsHistory")
    .select("*")
    .eq("modelId", modelId)
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Error fetching runs history:", error);
    return [];
  }

  return data;
}
