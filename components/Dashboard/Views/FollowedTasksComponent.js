import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  VStack,
  useMediaQuery,
  Button,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import PaperCard from "@/components/Cards/PaperCard";
import { useAuth } from "../../../context/AuthContext";

const EmptyState = () => (
  <VStack
    spacing={6}
    py={12}
    px={4}
    bg="gray.50"
    borderRadius="lg"
    align="center"
  >
    <VStack spacing={3}>
      <Text
        fontSize="lg"
        fontWeight="medium"
        color="gray.700"
        textAlign="center"
      >
        Get Started with Your Research Feed
      </Text>
      <Text color="gray.600" textAlign="center" maxW="md">
        Follow research topics above to see the latest papers and breakthroughs
        in your areas of interest. We&apos;ll curate a personalized feed of top
        papers for you.
      </Text>
    </VStack>
    <Button
      colorScheme="blue"
      rightIcon={<ArrowForwardIcon />}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      Browse Topics Above
    </Button>
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
      <Heading as="h2" size="md" mb={3}>
        {taskName}
      </Heading>
      <Box
        overflowX="auto"
        display="flex"
        gap={4}
        py={2}
        pb={4}
        px={2}
        css={{
          "&::-webkit-scrollbar": {
            height: "6px",
            background: "#f0f0f0",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#cbd5e0",
            borderRadius: "3px",
          },
          "&:hover::-webkit-scrollbar-thumb": {
            background: "#a0aec0",
          },
        }}
      >
        {papers.length > 0 ? (
          papers.map((paper) => (
            <Box key={paper.id} flex="0 0 auto" width="300px" maxWidth="300px">
              <PaperCard paper={paper} />
            </Box>
          ))
        ) : (
          <Text color="gray.500">
            No papers published in the last 7 days. Check back soon for updates.
          </Text>
        )}
      </Box>
    </Box>
  );

  return (
    <Box color="gray.700" py={isLargerThan480 ? 4 : 2} minH="60vh">
      <VStack spacing={2} align="stretch" mb={6}>
        <Heading as="h1" size="lg" letterSpacing="tight">
          Your Research Feed
        </Heading>
        <Text color="gray.600">
          Recent papers from your followed topics, updated daily
        </Text>
      </VStack>

      {isLoading ? (
        <Box textAlign="center" py={8}>
          <Spinner size="lg" color="blue.500" />
        </Box>
      ) : isError ? (
        <Box p={4} bg="red.50" color="red.600" borderRadius="md" mb={4}>
          <Text>
            Unable to load papers. Please try again later or refresh the page.
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
