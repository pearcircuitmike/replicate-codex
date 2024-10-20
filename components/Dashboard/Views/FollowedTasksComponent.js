import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  HStack,
  useMediaQuery,
} from "@chakra-ui/react";
import ResourceCard from "@/components/ResourceCard";
import { useAuth } from "../../../context/AuthContext";

// Helper to clean and truncate summaries
const cleanAndTruncateSummary = (summary, type) => {
  if (!summary) return "No description provided";

  if (type === "model") {
    summary = summary.replace("## Model overview", "").trim();
    summary = summary.replace("## Model Overview", "").trim();
  } else if (type === "paper") {
    summary = summary.replace("## Overview", "").replace(/-/g, "").trim();
    summary = summary.replace("## Overview - ", "").replace(/-/g, "").trim();
  }

  const maxLines = 3;
  const lines = summary.split("\n").filter(Boolean);

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines).join(" ") + "...";
  }

  return lines.join(" ");
};

const FollowedTasksComponent = () => {
  const { user } = useAuth();
  const [topTaskItems, setTopTaskItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLargerThan480] = useMediaQuery("(min-width: 480px)");

  useEffect(() => {
    const fetchTopTaskItems = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const response = await fetch(
            `/api/dashboard/get-followed-tasks?userId=${user.id}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch top task items.");
          }

          const data = await response.json();

          const tasksWithPaperDetails = await Promise.all(
            data.topTaskItems.map(async (task) => {
              const detailedItems = await Promise.all(
                task.topItems.map(async (paperId) => {
                  const paperResponse = await fetch(
                    `/api/fetch-paper-by-id?id=${paperId}`
                  );

                  if (!paperResponse.ok) {
                    console.error(`Failed to fetch paper with ID: ${paperId}`);
                    return null;
                  }

                  const paperData = await paperResponse.json();
                  return paperData;
                })
              );

              return {
                ...task,
                topItems: detailedItems.filter((item) => item !== null),
              };
            })
          );

          setTopTaskItems(tasksWithPaperDetails);
        } catch (error) {
          console.error("Error fetching top task items:", error);
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTopTaskItems();
  }, [user]);

  const renderSection = (taskName, items) => (
    <Box mb={8} key={taskName}>
      <Heading as="h2" size="md">
        {taskName}
      </Heading>
      <HStack
        spacing={4}
        overflowX="auto"
        py={2}
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        }}
      >
        {items.length > 0 ? (
          items.map((paper) => {
            const blurb = cleanAndTruncateSummary(
              paper.generatedSummary,
              "paper"
            );
            return (
              <ResourceCard
                key={paper.id}
                href={`/papers/arxiv/${encodeURIComponent(paper.slug)}`}
                title={paper.title}
                blurb={blurb}
                imageSrc={paper.thumbnail}
                score={Math.floor(paper.totalScore)}
                scoreLabel="Total Score"
                placeholderTitle="Paper"
                isLoading={false}
              />
            );
          })
        ) : (
          <Text>No top items available.</Text>
        )}
      </HStack>
    </Box>
  );

  return (
    <Box px={"2vw"} color="gray.700" py={isLargerThan480 ? 4 : 2}>
      <Heading as="h1" size="xl" mb={4}>
        Top Items for Your Followed Tasks
      </Heading>
      <Text mb={8}>
        This page shows the top papers published in the last 7 days for the
        tasks you are following.
      </Text>

      {isLoading && <Spinner size="lg" />}

      {hasError && (
        <Text color="red.500" mb={4}>
          Failed to load data. Please try again later.
        </Text>
      )}

      {!isLoading && !hasError && topTaskItems.length === 0 && (
        <Text>No top items found for your followed tasks.</Text>
      )}

      {!isLoading &&
        !hasError &&
        topTaskItems.length > 0 &&
        topTaskItems.map((task) => renderSection(task.taskName, task.topItems))}
    </Box>
  );
};

export default FollowedTasksComponent;
