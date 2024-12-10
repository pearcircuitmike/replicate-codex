import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Spinner,
  Text,
  Heading,
  useMediaQuery,
} from "@chakra-ui/react";
import StatBox from "./StatBox";

const StatsSection = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMdOrBelow] = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats/get-overall-stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <Box textAlign="center" py={16}>
        <Spinner size="lg" />
        <Text mt={4}>Loading statistics...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={16}>
        <Heading size="md" color="red.500">
          Error Loading Stats
        </Heading>
        <Text color="gray.600">{error}</Text>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box textAlign="center" py={16}>
        <Heading size="md" color="gray.500">
          No statistics available
        </Heading>
      </Box>
    );
  }

  const {
    weeklyPapersCount,
    weeklySummariesCount,
    weeklySignups,
    uniquePapersCount,
  } = stats;

  const Layout = isMdOrBelow ? VStack : HStack;
  const backgroundImage = isMdOrBelow
    ? 'url("/funnel-vertical.svg")'
    : 'url("/funnel-horizontal.svg")';

  return (
    <Box overflow="hidden" py={16}>
      <Container maxW="7xl">
        <Box
          position="relative"
          width="full"
          bg="blue.50"
          rounded={10}
          shadow="md"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            backgroundImage={backgroundImage}
            backgroundSize="100% 100%"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
          />
          <Box position="relative" mx="auto" px={8} py={4} zIndex={1}>
            <Layout spacing={8} my="100px">
              <StatBox
                title="We read everything"
                description="We scan every platform for the top AI models and papers"
                stat={weeklyPapersCount}
                statDescription="discoveries indexed this week"
              />
              <StatBox
                title="We write summaries"
                description="Short, clear guides for each model and paper."
                stat={weeklySummariesCount}
                statDescription="summaries written"
              />
              <StatBox
                title="You follow topics"
                description="Set alerts for topics you care about."
                stat={weeklySignups}
                statDescription="researchers set alerts this week"
              />
              <StatBox
                title="You read the TLDR"
                description="We only send the top papers. No noise, only signal."
                stat={uniquePapersCount}
                statDescription="bite-sized summaries sent"
              />
            </Layout>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default StatsSection;
