import React, { useState, useEffect } from "react";
import {
  VStack,
  Text,
  Box,
  Spinner,
  Wrap,
  WrapItem,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import TaskTag from "@/components/TaskTag";
import supabase from "@/pages/api/utils/supabaseClient";

const TaskSidebar = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  const fetchTasks = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Fetch all tasks including task_category
      const { data: allTasks, error: tasksError } = await supabase
        .from("tasks")
        .select("id, task, task_category");

      if (tasksError) throw tasksError;

      // Fetch user's followed tasks
      const { data: followedTasks, error: followedError } = await supabase
        .from("followed_tasks")
        .select("task_id")
        .eq("user_id", user.id);

      if (followedError) throw followedError;

      // Create a set of followed task IDs for efficient lookup
      const followedTaskIds = new Set(followedTasks.map((ft) => ft.task_id));

      // Combine the data
      const tasksWithFollowStatus = allTasks.map((task) => ({
        ...task,
        isFollowed: followedTaskIds.has(task.id),
      }));

      setTasks(tasksWithFollowStatus);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error fetching tasks",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleTaskToggle = async (taskId, newFollowStatus) => {
    // Update local state immediately for responsive UI
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, isFollowed: newFollowStatus } : task
      )
    );

    // Then update the database
    try {
      if (newFollowStatus) {
        await supabase
          .from("followed_tasks")
          .insert({ user_id: user.id, task_id: taskId });
      } else {
        await supabase
          .from("followed_tasks")
          .delete()
          .match({ user_id: user.id, task_id: taskId });
      }
    } catch (error) {
      console.error("Error updating task follow status:", error);
      toast({
        title: "Error updating task",
        description: "Failed to update task follow status. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      // Revert the local state change if the database update failed
      fetchTasks();
    }
  };

  const groupTasksByCategory = (tasks) => {
    const grouped = {};
    tasks.forEach((task) => {
      if (!grouped[task.task_category]) {
        grouped[task.task_category] = [];
      }
      grouped[task.task_category].push(task);
    });
    return grouped;
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner />
      </Box>
    );
  }

  const groupedTasks = groupTasksByCategory(tasks);

  return (
    <VStack align="stretch" spacing={4} px={4}>
      <Text fontSize="lg" fontWeight="bold">
        Tasks
      </Text>
      {Object.keys(groupedTasks).map((category) => (
        <Box key={category}>
          <Text fontSize="md" fontWeight="semibold" mb={2}>
            {category}
          </Text>
          <Wrap spacing={2}>
            {groupedTasks[category].map((task) => (
              <WrapItem key={task.id}>
                <TaskTag
                  task={task}
                  initialIsFollowed={task.isFollowed}
                  onToggle={(newStatus) => handleTaskToggle(task.id, newStatus)}
                />
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      ))}
    </VStack>
  );
};

export default TaskSidebar;
