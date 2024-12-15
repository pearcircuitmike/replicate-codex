import React, { useState, useEffect } from "react";
import { Tag, useToast, Tooltip } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";

const TaskTag = ({ task, initialIsFollowed }) => {
  const [isFollowed, setIsFollowed] = useState(initialIsFollowed);
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken, user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    setIsFollowed(initialIsFollowed);
  }, [initialIsFollowed]);

  const toggleFollow = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow tasks",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    const wasFollowed = isFollowed;

    try {
      const endpoint = wasFollowed
        ? "/api/tasks/remove-followed-task"
        : "/api/tasks/add-followed-task";

      const response = await fetch(endpoint, {
        method: wasFollowed ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId: task.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update task follow status");
      }

      setIsFollowed(!wasFollowed);
      toast({
        title: wasFollowed ? "Task unfollowed" : "Task followed",
        description: wasFollowed
          ? "You will no longer receive updates for this task."
          : "You will now receive updates for this task.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error toggling follow status:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Failed to update task follow status. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip
      label={
        user
          ? isFollowed
            ? "Unfollow topic"
            : "Click to follow topic"
          : "Sign in to follow topic"
      }
      aria-label="Follow/Unfollow tooltip"
      hasArrow
    >
      <Tag
        size="md"
        bg="white"
        borderRadius="md"
        border="1px solid"
        borderColor={isFollowed ? "green.400" : "gray.100"}
        backgroundColor={isFollowed ? "green.50" : "gray.100"}
        color={isFollowed ? "green.400" : "gray.600"}
        boxShadow="sm"
        px="5px"
        _hover={{ boxShadow: "md", cursor: "pointer" }}
        onClick={toggleFollow}
        opacity={isLoading ? 0.7 : 1}
        pointerEvents={isLoading ? "none" : "auto"}
      >
        {task.task}
      </Tag>
    </Tooltip>
  );
};

export default TaskTag;
