// File: pages/api/papers/paper-tasks-from-id.js

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const {
    query: { paperId },
    method,
  } = req;

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  if (!paperId) {
    return res.status(400).json({ error: "Missing paperId parameter" });
  }

  try {
    // Fetch the paper by ID
    const { data: paper, error: paperError } = await supabase
      .from("arxivPapersData")
      .select("task_ids")
      .eq("id", paperId)
      .single();

    if (paperError) {
      throw paperError;
    }

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    const { task_ids } = paper;

    if (!task_ids || task_ids.length === 0) {
      return res.status(200).json({ tasks: [] });
    }

    // Fetch tasks based on task_ids
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, task, task_category")
      .in("id", task_ids);

    if (tasksError) {
      throw tasksError;
    }

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
