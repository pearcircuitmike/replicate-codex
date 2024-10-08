import React, { useState, useEffect } from "react";
import {
  VStack,
  Text,
  Box,
  Spinner,
  Wrap,
  WrapItem,
  useToast,
  Collapse,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons"; // Update to use the correct icons
import { useAuth } from "@/context/AuthContext";
import TaskTag from "@/components/TaskTag";
import supabase from "@/pages/api/utils/supabaseClient";

const TaskSidebar = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState(null); // Track which category is open
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
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, isFollowed: newFollowStatus } : task
      )
    );

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

  const toggleCategory = (category) => {
    if (openCategory === category) {
      setOpenCategory(null); // Close category if it's already open
    } else {
      setOpenCategory(category); // Open the clicked category and close others
    }
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
      <Text fontSize="sm" color="gray.500">
        Tasks
      </Text>
      {Object.keys(groupedTasks).map((category) => (
        <Box key={category}>
          <HStack justify="space-between" align="top">
            <Text ml={5} fontSize="sm" color="gray.600">
              {category}
            </Text>
            <IconButton
              icon={
                openCategory === category ? (
                  <ChevronUpIcon />
                ) : (
                  <ChevronDownIcon />
                )
              }
              variant="ghost"
              size="sm"
              onClick={() => toggleCategory(category)}
            />
          </HStack>
          <Collapse in={openCategory === category}>
            <Wrap spacing={2} ml={5}>
              {groupedTasks[category].map((task) => (
                <WrapItem key={task.id}>
                  <TaskTag
                    task={task}
                    initialIsFollowed={task.isFollowed}
                    onToggle={(newStatus) =>
                      handleTaskToggle(task.id, newStatus)
                    }
                  />
                </WrapItem>
              ))}
            </Wrap>
          </Collapse>
        </Box>
      ))}
    </VStack>
  );
};

export default TaskSidebar;
