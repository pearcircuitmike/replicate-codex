// /pages/api/tasks/add-followed-task.js
import supabase from "../utils/supabaseClient";
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  const { taskId } = req.body;

  if (!token || !taskId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Check if task is already followed
    const { data: existingFollow, error: checkError } = await supabase
      .from("followed_tasks")
      .select()
      .eq("user_id", user.id)
      .eq("task_id", taskId)
      .single();

    if (existingFollow) {
      return res.status(200).json({ message: "Task already followed" });
    }

    // Insert new followed task
    const { data, error } = await supabase
      .from("followed_tasks")
      .insert({
        user_id: user.id,
        task_id: taskId,
      })
      .select()
      .single();

    if (error) throw error;

    res
      .status(201)
      .json({ message: "Task followed successfully", followedTask: data });
  } catch (error) {
    console.error("Error adding followed task:", error);
    res
      .status(500)
      .json({ error: "An error occurred while following the task" });
  }
}
