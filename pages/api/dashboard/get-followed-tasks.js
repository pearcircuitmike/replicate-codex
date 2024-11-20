// /pages/api/dashboard/get-followed-tasks.js
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
    const { data: userTasks, error: fetchError } = await supabase
      .from("live_user_tasks_with_top_papers")
      .select(
        "followed_task_id, task_name, top_paper_1, top_paper_2, top_paper_3"
      )
      .eq("user_id", userId)
      .order("followed_task_id", { ascending: true });

    if (fetchError) {
      console.error("Error fetching user tasks:", fetchError);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Return empty array if no tasks found (not an error condition)
    res.status(200).json({
      tasks: (userTasks || []).map((task) => ({
        followedTaskId: task.followed_task_id,
        taskName: task.task_name,
        topPapers: [
          task.top_paper_1,
          task.top_paper_2,
          task.top_paper_3,
        ].filter(Boolean),
      })),
    });
  } catch (error) {
    console.error("Error in task fetch handler:", error);
    res.status(500).json({ error: "An error occurred while fetching tasks" });
  }
}
