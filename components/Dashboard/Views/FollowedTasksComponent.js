import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  HStack,
  useMediaQuery,
  VStack,
  Button,
} from "@chakra-ui/react";
import ResourceCard from "@/components/ResourceCard";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";

const cleanAndTruncateSummary = (summary) => {
  if (!summary) return "No description provided";

  // Remove common headers and dashes
  summary = summary
    .replace(/## Overview.*?-/g, "")
    .replace(/## Model [Oo]verview/g, "")
    .replace(/-/g, "")
    .trim();

  // Take first 3 non-empty lines
  const maxLines = 3;
  const lines = summary.split("\n").filter(Boolean);

  return lines.length > maxLines
    ? lines.slice(0, maxLines).join(" ") + "..."
    : lines.join(" ");
};

const EmptyState = () => (
  <VStack spacing={4} py={8}>
    <Text fontSize="lg" color="gray.600">
      You haven&apos;t followed any tasks yet
    </Text>
    <Link href="/topics" passHref></Link>
  </VStack>
);

const FollowedTasksComponent = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isLargerThan480] = useMediaQuery("(min-width: 480px)");

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setIsError(false);

      const response = await fetch(
        `/api/dashboard/get-followed-tasks?userId=${user.id}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch tasks");
      }

      const { tasks: fetchedTasks } = await response.json();

      // Fetch paper details for each task's top papers
      const tasksWithPaperDetails = await Promise.all(
        fetchedTasks.map(async (task) => {
          const detailedPapers = await Promise.all(
            task.topPapers.map(async (paperId) => {
              if (!paperId) return null;

              try {
                const paperResponse = await fetch(
                  `/api/fetch-paper-by-id?id=${paperId}`
                );

                if (!paperResponse.ok) {
                  console.error(`Failed to fetch paper with ID: ${paperId}`);
                  return null;
                }

                return await paperResponse.json();
              } catch (error) {
                console.error(`Error fetching paper ${paperId}:`, error);
                return null;
              }
            })
          );

          return {
            ...task,
            topPapers: detailedPapers.filter(Boolean),
          };
        })
      );

      setTasks(tasksWithPaperDetails);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Listen for task follow/unfollow events
  useEffect(() => {
    const handleTaskUpdate = () => {
      fetchTasks();
    };

    window.addEventListener("taskFollowUpdated", handleTaskUpdate);

    return () => {
      window.removeEventListener("taskFollowUpdated", handleTaskUpdate);
    };
  }, [fetchTasks]);

  const renderTaskSection = (taskName, papers) => (
    <Box
      mb={8}
      key={taskName}
      opacity={1}
      transition="opacity 0.3s ease-in-out"
    >
      <Heading as="h2" size="md">
        {taskName}
      </Heading>
      <HStack
        spacing={4}
        overflowX="auto"
        py={2}
        css={{
          "&::-webkit-scrollbar": { display: "none" },
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        }}
      >
        {papers.length > 0 ? (
          papers.map((paper) => (
            <ResourceCard
              key={paper.id}
              href={`/papers/arxiv/${encodeURIComponent(paper.slug)}`}
              title={paper.title}
              blurb={cleanAndTruncateSummary(paper.generatedSummary)}
              imageSrc={paper.thumbnail}
              score={Math.floor(paper.totalScore)}
              scoreLabel="Total Score"
              placeholderTitle="Paper"
              isLoading={false}
            />
          ))
        ) : (
          <Text color="gray.500">No recent papers for this task.</Text>
        )}
      </HStack>
    </Box>
  );

  return (
    <Box px={"2vw"} color="gray.700" py={isLargerThan480 ? 4 : 2} minH="60vh">
      <Heading as="h1" size="xl" mb={4}>
        Top Papers for Your Followed Tasks
      </Heading>
      <Text mb={8} color="gray.600">
        Top papers published in the last 7 days for your followed tasks.
      </Text>

      {isLoading ? (
        <Box textAlign="center" py={8}>
          <Spinner size="lg" color="blue.500" />
        </Box>
      ) : isError ? (
        <Box p={4} bg="red.50" color="red.600" borderRadius="md" mb={4}>
          <Text>
            Unable to load tasks. Please try again later or refresh the page.
          </Text>
        </Box>
      ) : tasks.length === 0 ? (
        <EmptyState />
      ) : (
        <Box>
          {tasks.map((task) =>
            renderTaskSection(task.taskName, task.topPapers)
          )}
        </Box>
      )}
    </Box>
  );
};

export default FollowedTasksComponent;
