import React, { useEffect, useState } from "react";
import { Box, VStack, Heading, Text, Link, Spinner } from "@chakra-ui/react";
import NextLink from "next/link";

const TrendingTopics = () => {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch("/api/dashboard/trending-topics");
        if (!response.ok) throw new Error("Failed to fetch topics");
        const data = await response.json();
        // Randomize the order of topics
        const shuffledTopics = data.sort(() => Math.random() - 0.5);
        setTopics(shuffledTopics);
      } catch (error) {
        console.error("Error fetching trending topics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const getTopicAge = (createdAt) => {
    if (!createdAt) return "Unknown";

    const now = new Date();
    const topicDate = new Date(createdAt);

    if (isNaN(topicDate.getTime())) {
      console.error("Invalid date:", createdAt);
      return "Unknown";
    }

    const diffHours = Math.floor((now - topicDate) / (1000 * 60 * 60));

    if (diffHours < 2) return "Trending now";
    return `Trending ${diffHours} hours ago`;
  };

  if (isLoading) {
    return (
      <Box p={4}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Box width="100%" p={4}>
      <Heading as="h2" size="md" mb={1}>
        📈 Top research areas
      </Heading>
      <Text color="gray.500" mb={4} fontSize="sm">
        Today&apos;s top research topics
      </Text>
      <VStack spacing={4} align="stretch">
        {topics.map((topic) => (
          <NextLink
            key={topic.id}
            href={`/dashboard/explore/${topic.id}`}
            passHref
          >
            <Box
              p={3}
              borderWidth={1}
              borderRadius="md"
              boxShadow="sm"
              _hover={{ bg: "gray.50" }}
            >
              <Text fontWeight="bold">{topic.topic_name}</Text>
              <Text fontSize="sm" color="gray.600">
                {topic.keywords.slice(0, 3).join(", ")}
              </Text>
              <Text fontSize="xs" color="gray.400" mt={1}>
                {getTopicAge(topic.created_at)}
              </Text>
            </Box>
          </NextLink>
        ))}
      </VStack>
    </Box>
  );
};

export default TrendingTopics;
