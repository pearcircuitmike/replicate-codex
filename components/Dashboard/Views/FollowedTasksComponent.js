import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  VStack,
  useMediaQuery,
} from "@chakra-ui/react";
import PaperCard from "@/components/Cards/PaperCard";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";

const EmptyState = () => (
  <VStack spacing={4} py={8}>
    <Text fontSize="lg" color="gray.600">
      You haven&apos;t followed any tasks yet.
    </Text>
    <Link href="/topics" passHref>
      <Text color="blue.500" as="u">
        Discover topics to follow
      </Text>
    </Link>
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

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
    <Box mb={8} key={taskName}>
      <Heading as="h2" size="md" mb={4}>
        {taskName}
      </Heading>
      <Box
        overflowX="auto"
        display="flex"
        gap={4}
        py={2}
        px={2}
        css={{
          "&::-webkit-scrollbar": { display: "none" },
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        }}
      >
        {papers.length > 0 ? (
          papers.map((paper) => (
            <Box
              key={paper.id}
              flex="0 0 auto"
              width="300px" // Fixed width for all cards
              maxWidth="300px"
            >
              <PaperCard
                paper={{
                  id: paper.id,
                  title: paper.title,
                  authors: paper.authors || [],
                  generatedSummary: paper.generatedSummary, // Pass directly to PaperCard
                  publishedDate:
                    paper.publishedDate || new Date().toISOString(),
                  indexedDate: paper.indexedDate || new Date().toISOString(),
                  thumbnail: paper.thumbnail,
                  platform: "arxiv",
                  slug: paper.slug,
                  totalScore: paper.totalScore || 0,
                }}
              />
            </Box>
          ))
        ) : (
          <Text color="gray.500">No recent papers for this task.</Text>
        )}
      </Box>
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
