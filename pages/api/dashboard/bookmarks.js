import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const getTableName = (resourceType) => {
  switch (resourceType) {
    case "paper":
      return "arxivPapersData";
    case "model":
      return "modelsData";
    default:
      throw new Error(`Unsupported resource type: ${resourceType}`);
  }
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { userId, resourceType } = req.query;

    if (!userId || !resourceType) {
      return res.status(400).json({ error: "Missing userId or resourceType" });
    }

    try {
      const { data: bookmarkData, error: bookmarkError } = await supabase
        .from("bookmarks")
        .select("bookmarked_resource, created_at")
        .eq("user_id", userId)
        .eq("resource_type", resourceType)
        .order("created_at", { ascending: false });

      if (bookmarkError) throw bookmarkError;

      const resourceIds = bookmarkData.map(
        (bookmark) => bookmark.bookmarked_resource
      );

      const tableName = getTableName(resourceType);

      const { data: resources, error: resourcesError } = await supabase
        .from(tableName)
        .select("*")
        .in("id", resourceIds);

      if (resourcesError) throw resourcesError;

      const orderedResources = resourceIds.map((id) =>
        resources.find((resource) => resource.id === id)
      );

      res.status(200).json(orderedResources);
    } catch (error) {
      console.error("Error fetching bookmarked resources:", error);
      res.status(500).json({
        error: "An error occurred while fetching bookmarked resources",
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
