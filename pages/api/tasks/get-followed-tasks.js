// /pages/api/tasks/get-followed-tasks.js
import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { paperId } = req.query;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    // Fetch task_ids associated with the paper
    const { data: paper, error: paperError } = await supabase
      .from("arxivPapersData")
      .select("task_ids")
      .eq("id", paperId)
      .single();

    if (paperError) {
      throw paperError;
    }

    if (!paper || !paper.task_ids || paper.task_ids.length === 0) {
      return res.status(200).json({ tasks: [] });
    }

    // Fetch details of the associated tasks
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .in("id", paper.task_ids);

    if (tasksError) {
      throw tasksError;
    }

    // If no auth token, return tasks without follow status
    if (!token) {
      const tasksWithoutFollowStatus = tasks.map((task) => ({
        ...task,
        isFollowed: false,
      }));
      return res.status(200).json({ tasks: tasksWithoutFollowStatus });
    }

    // If auth token present, verify user and get follow status
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      // Return tasks without follow status if token is invalid
      const tasksWithoutFollowStatus = tasks.map((task) => ({
        ...task,
        isFollowed: false,
      }));
      return res.status(200).json({ tasks: tasksWithoutFollowStatus });
    }

    // Fetch followed tasks for the authenticated user
    const { data: followedTasks, error: followError } = await supabase
      .from("followed_tasks")
      .select("task_id")
      .eq("user_id", user.id)
      .in("task_id", paper.task_ids);

    if (followError) {
      throw followError;
    }

    // Create a Set of followed task IDs for efficient lookup
    const followedTaskIds = new Set(followedTasks.map((t) => t.task_id));

    // Map tasks to include the isFollowed flag
    const tasksWithFollowStatus = tasks.map((task) => ({
      ...task,
      isFollowed: followedTaskIds.has(task.id),
    }));

    res.status(200).json({ tasks: tasksWithFollowStatus });
  } catch (error) {
    console.error("Error fetching paper tasks:", error);
    res.status(500).json({ error: "An error occurred while fetching tasks" });
  }
}
