import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { session_id, resource_type } = req.query;

  if (!session_id || !resource_type) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const currentTime = new Date();
    const firstDayOfMonth = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      1
    );

    // Fetch all events for this session and resource type in the current month
    const { data: events, error: eventsError } = await supabase
      .from("analytics_events")
      .select("event_data, timestamp")
      .eq("event_type", "page_view")
      .eq("session_id", session_id)
      .gte("timestamp", firstDayOfMonth.toISOString());

    if (eventsError)
      throw new Error(`Events fetch error: ${eventsError.message}`);

    // Extract unique resources from event_data based on resource type
    const uniqueResources = new Set(
      events
        .filter((event) =>
          event.event_data.page.startsWith(`/${resource_type}/`)
        )
        .map((event) => event.event_data.page)
    );
    const totalCount = uniqueResources.size;
    const canViewFullArticle = totalCount < 5;

    console.log(`Total unique ${resource_type} views: ${totalCount}`);
    console.log("Unique resources:", Array.from(uniqueResources));

    res.status(200).json({
      totalUniqueViews: totalCount,
      uniqueResources: Array.from(uniqueResources),
      canViewFullArticle: canViewFullArticle,
    });
  } catch (error) {
    console.error("Error in resource-view-count API:", error);
    res.status(500).json({
      message: "Error getting resource view count",
      error: error.message,
    });
  }
}
