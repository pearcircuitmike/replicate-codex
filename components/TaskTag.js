import React, { useState, useEffect } from "react";
import { Tag, IconButton, useToast } from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";
import { useAuth } from "@/context/AuthContext";

const TaskTag = ({ task, initialIsFollowed }) => {
  const [isFollowed, setIsFollowed] = useState(initialIsFollowed);
  const { accessToken } = useAuth();
  const toast = useToast();

  useEffect(() => {
    setIsFollowed(initialIsFollowed);
  }, [initialIsFollowed]);

  const toggleFollow = async () => {
    if (!accessToken) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow tasks.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const endpoint = isFollowed
        ? "/api/tasks/remove-followed-task"
        : "/api/tasks/add-followed-task";
      const method = isFollowed ? "DELETE" : "POST";

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId: task.id }),
      });

      if (response.ok) {
        setIsFollowed(!isFollowed);
        toast({
          title: isFollowed ? "Task unfollowed" : "Task followed",
          description: isFollowed
            ? "You will no longer receive updates for this task."
            : "You will now receive updates for this task.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("Failed to update task follow status");
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      toast({
        title: "Error",
        description: "Failed to update task follow status. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Tag
      size="md"
      variant="subtle"
      colorScheme={isFollowed ? "green" : "gray"}
      borderRadius="full"
    >
      {task.task}
      <IconButton
        icon={<BellIcon />}
        size="xs"
        ml={2}
        onClick={toggleFollow}
        aria-label={isFollowed ? "Unfollow task" : "Follow task"}
        title={isFollowed ? "Unfollow task" : "Follow task"}
        variant="ghost"
        colorScheme={isFollowed ? "green" : "gray"}
      />
    </Tag>
  );
};

export default TaskTag;
