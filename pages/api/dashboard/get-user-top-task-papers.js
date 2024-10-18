// pages/api/dashboard/get-user-top-task-papers.js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" });
  }

  try {
    // Fetch top papers from the materialized view based on user ID
    const { data: topTaskPapers, error: fetchError } = await supabase
      .from("user_followed_tasks_with_top_papers")
      .select("*")
      .eq("user_id", userId)
      .order("followed_task_id", { ascending: true });

    if (fetchError) {
      console.error("Error fetching top task papers:", fetchError);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!topTaskPapers || topTaskPapers.length === 0) {
      return res
        .status(404)
        .json({ error: "No top task papers found for this user" });
    }

    const result = topTaskPapers.map((task) => ({
      followedTaskId: task.followed_task_id,
      topPapers: [task.top_paper_1, task.top_paper_2, task.top_paper_3].filter(
        Boolean
      ),
    }));

    res.status(200).json({ topTaskPapers: result });
  } catch (error) {
    console.error("Error fetching top task papers:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching top papers" });
  }
}
