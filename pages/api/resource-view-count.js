import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to parse JSON event data if needed
function parseEventData(eventData) {
  if (typeof eventData === "string") {
    try {
      return JSON.parse(eventData);
    } catch (err) {
      console.error("JSON parse error:", eventData);
      return null;
    }
  }
  return eventData;
}

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { session_id, resource_type } = req.query;

  // Check for required parameters
  if (!session_id || !resource_type) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    // First day of the current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch page_view events for the given session and date range
    const { data: events, error: eventsError } = await supabase
      .from("analytics_events")
      .select("event_data, timestamp")
      .eq("event_type", "page_view")
      .eq("session_id", session_id)
      .gte("timestamp", firstDayOfMonth.toISOString());

    if (eventsError) {
      throw new Error(`Events fetch error: ${eventsError.message}`);
    }

    // Collect unique resources
    const uniqueResources = new Set();

    for (const event of events) {
      const parsedData = parseEventData(event.event_data);
      if (!parsedData) continue;

      const page = parsedData.page;
      if (typeof page === "string" && page.startsWith(`/${resource_type}/`)) {
        uniqueResources.add(page);
      }
    }

    // Determine whether the user can view the full article
    const totalUniqueViews = uniqueResources.size;
    const canViewFullArticle = totalUniqueViews <= 5;

    return res.status(200).json({
      totalUniqueViews,
      uniqueResources: Array.from(uniqueResources),
      canViewFullArticle,
    });
  } catch (error) {
    console.error("Error in resource-view-count API:", error);
    return res.status(500).json({
      message: "Error getting resource view count",
      error: error.message,
    });
  }
}
