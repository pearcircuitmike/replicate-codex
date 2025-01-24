// /components/Community/JoinLeaveButton.jsx

import React, { useState } from "react";
import { Button, useToast } from "@chakra-ui/react";
import supabase from "@/pages/api/utils/supabaseClient";

export default function JoinLeaveButton({
  communityId,
  userId,
  isMember,
  onToggle,
}) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleJoin = async () => {
    setLoading(true);
    try {
      // 1) Insert into community_members
      const { error: joinError } = await supabase
        .from("community_members")
        .insert([{ community_id: communityId, user_id: userId }]);
      if (joinError) throw joinError;

      // 2) Fetch the tasks for this community
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

        if (checkErr && checkErr.code !== "PGRST116") {
          // "PGRST116" means "No rows found" — only throw if it's some other error
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

      toast({
        title: "Joined community",
        status: "success",
        duration: 1500,
        isClosable: true,
      });
      onToggle?.(true);
    } catch (err) {
      console.error("Join error:", err);
      toast({
        title: "Failed to join",
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    setLoading(true);
    try {
      // 1) Remove row from community_members
      const { error: leaveError } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", userId);

      if (leaveError) throw leaveError;

      // 2) Fetch tasks for this community
      const { data: tasksInCommunity, error: tasksError } = await supabase
        .from("community_tasks")
        .select("task_id")
        .eq("community_id", communityId);

      if (tasksError) throw tasksError;

      // 3) For each task in this community, check if user is still
      //    in any other community that references that same task.
      for (const ct of tasksInCommunity || []) {
        const taskId = ct.task_id;

        // Check if the user still has membership in another community
        // that references the same task
        //  - community_tasks -> find all communities that have that task
        //  - community_members -> find if user is still a member of any of those
        const { data: otherCommunitiesForTask, error: ocErr } = await supabase
          .from("community_tasks")
          .select("community_id")
          .eq("task_id", taskId);

        if (ocErr) throw ocErr;

        // Build an array of just community IDs for that task
        const cIds = (otherCommunitiesForTask || []).map(
          (row) => row.community_id
        );

        if (cIds.length === 0) {
          // If no other community references this task,
          // user can safely unfollow it.
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

      toast({
        title: "Left community",
        status: "info",
        duration: 1500,
        isClosable: true,
      });
      onToggle?.(false);
    } catch (err) {
      console.error("Leave error:", err);
      toast({
        title: "Failed to leave",
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      isLoading={loading}
      onClick={isMember ? handleLeave : handleJoin}
      colorScheme={isMember ? "gray" : "blue"}
    >
      {isMember ? "Leave" : "Join"}
    </Button>
  );
}
