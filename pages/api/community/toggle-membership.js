// pages/api/community/toggle-membership.js
import supabase from "../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, communityId, join } = req.body;

    if (!userId || !communityId) {
      return res
        .status(400)
        .json({ error: "Missing userId or communityId in request body." });
    }

    // If "join" is true, add membership. Otherwise remove.
    if (join) {
      // 1) Insert membership
      const { error: joinError } = await supabase
        .from("community_members")
        .insert([{ community_id: communityId, user_id: userId }]);

      // If it's a duplicate, Supabase might throw a unique key error.
      // We'll just ignore that or you can handle it carefully.
      if (joinError && !joinError.message.includes("duplicate key")) {
        throw joinError;
      }

      // 2) Fetch tasks in this community
      const { data: tasksInCommunity, error: tasksError } = await supabase
        .from("community_tasks")
        .select("task_id")
        .eq("community_id", communityId);

      if (tasksError) throw tasksError;

      // 3) For each task, follow it if not already followed
      for (const ct of tasksInCommunity || []) {
        const taskId = ct.task_id;

        // Check if user already follows this task
        const { data: existing, error: checkErr } = await supabase
          .from("followed_tasks")
          .select("id")
          .eq("user_id", userId)
          .eq("task_id", taskId)
          .single();

        // "PGRST116" means no rows found, so ignore that. If something else, throw.
        if (checkErr && checkErr.code !== "PGRST116") {
          throw checkErr;
        }

        // If not followed, add a row in followed_tasks
        if (!existing) {
          const { error: followErr } = await supabase
            .from("followed_tasks")
            .insert([{ user_id: userId, task_id: taskId }]);

          if (followErr) {
            console.error("Failed to follow task:", followErr);
          }
        }
      }

      return res.status(200).json({ success: true, joined: true });
    } else {
      // LEAVE LOGIC
      // 1) Remove row from community_members
      const { error: leaveError } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", userId);

      if (leaveError) throw leaveError;

      // 2) Fetch tasks in this community
      const { data: tasksInCommunity, error: tasksError } = await supabase
        .from("community_tasks")
        .select("task_id")
        .eq("community_id", communityId);

      if (tasksError) throw tasksError;

      // 3) For each task, check if user is still in any other community referencing the same task
      for (const ct of tasksInCommunity || []) {
        const taskId = ct.task_id;

        // Find all communities that reference this task
        const { data: otherCommunitiesForTask, error: ocErr } = await supabase
          .from("community_tasks")
          .select("community_id")
          .eq("task_id", taskId);

        if (ocErr) throw ocErr;

        const cIds = (otherCommunitiesForTask || []).map(
          (row) => row.community_id
        );

        // If no other community references this task, remove from followed_tasks
        if (cIds.length === 0) {
          await supabase
            .from("followed_tasks")
            .delete()
            .eq("user_id", userId)
            .eq("task_id", taskId);
          continue;
        }

        // Now see if the user belongs to ANY of these community IDs
        const { data: stillMember, error: memCheckErr } = await supabase
          .from("community_members")
          .select("id")
          .eq("user_id", userId)
          .in("community_id", cIds)
          .limit(1);

        if (memCheckErr) throw memCheckErr;

        // If not a member in any other community for this task => remove from followed_tasks
        if (!stillMember || stillMember.length === 0) {
          await supabase
            .from("followed_tasks")
            .delete()
            .eq("user_id", userId)
            .eq("task_id", taskId);
        }
      }

      return res.status(200).json({ success: true, joined: false });
    }
  } catch (error) {
    console.error("Error in /api/community/toggle-membership:", error);
    return res.status(500).json({ error: error.message });
  }
}
