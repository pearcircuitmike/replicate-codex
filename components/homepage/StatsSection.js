import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  useMediaQuery,
  Container,
} from "@chakra-ui/react";

function StatsSection() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [isMdOrBelow] = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats/get-overall-stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err);
      }
    }
    fetchStats();
  }, []);

  if (error) {
    return (
      <Box bg="blue.50" py={16} width="100vw">
        <Container maxW="7xl">
          <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
            How it works
          </Heading>
          <Text textAlign="center" color="red.500">
            {error.message}
          </Text>
        </Container>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box bg="blue.50" py={16} width="100vw">
        <Container maxW="7xl">
          <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
            How it works
          </Heading>
          <Text textAlign="center">Loading stats...</Text>
        </Container>
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
    <Box py={16} width="100vw" overflow="hidden">
      <Container maxW="7xl">
        <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
          How it works
        </Heading>

        <Box
          position="relative"
          width="full"
          bg="blue.50"
          rounded={10}
          shadow="md"
          minH={isMdOrBelow ? "600px" : "400px"}
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
          <Box position="relative" mx="auto" px={8} py={8} zIndex={1}>
            <Layout my="10%">
              <Box
                bg="white"
                p={6}
                borderRadius="md"
                boxShadow="md"
                textAlign="center"
              >
                <Heading fontSize="lg" mb={2}>
                  Discover AI breakthroughs
                </Heading>
                <Text fontSize="sm" mb={2} color="gray.700">
                  Our algorithm finds the most impactful AI developments.
                </Text>
                <Heading fontSize="2xl" color="red.500" mb={1}>
                  {weeklyPapersCount}
                </Heading>
                <Text fontSize="xs" color="gray.600">
                  Papers & models this week
                </Text>
              </Box>

              <Box
                bg="white"
                p={6}
                borderRadius="md"
                boxShadow="md"
                textAlign="center"
              >
                <Heading fontSize="lg" mb={2}>
                  Skim summaries
                </Heading>
                <Text fontSize="sm" mb={2} color="gray.700">
                  Short, clear guides for each model & paper.
                </Text>
                <Heading fontSize="2xl" color="red.500" mb={1}>
                  {weeklySummariesCount}
                </Heading>
                <Text fontSize="xs" color="gray.600">
                  Summaries this week
                </Text>
              </Box>

              <Box
                bg="white"
                p={6}
                borderRadius="md"
                boxShadow="md"
                textAlign="center"
              >
                <Heading fontSize="lg" mb={2}>
                  Meet helpful experts
                </Heading>
                <Text fontSize="sm" mb={2} color="gray.700">
                  Join Discord to chat with creators & builders.
                </Text>
                <Heading fontSize="2xl" color="red.500" mb={1}>
                  {weeklySignups}
                </Heading>
                <Text fontSize="xs" color="gray.600">
                  New ML researchers this week
                </Text>
              </Box>

              <Box
                bg="white"
                p={6}
                borderRadius="md"
                boxShadow="md"
                textAlign="center"
              >
                <Heading fontSize="lg" mb={2}>
                  Subscribe now
                </Heading>
                <Text fontSize="sm" mb={2} color="gray.700">
                  Get exclusive access to our AI community & more!
                </Text>
                <Heading fontSize="2xl" color="red.500" mb={1}>
                  {uniquePapersCount}
                </Heading>
                <Text fontSize="xs" color="gray.600">
                  Unique papers across top tasks
                </Text>
              </Box>
            </Layout>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default function App() {
  return (
    <ChakraProvider>
      <StatsSection />
    </ChakraProvider>
  );
}
