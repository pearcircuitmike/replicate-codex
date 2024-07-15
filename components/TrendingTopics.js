// components/TrendingTopics.js
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
        setTopics(data);
      } catch (error) {
        console.error("Error fetching trending topics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (isLoading) {
    return (
      <Box p={4}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Box width="250px" bg="white" boxShadow="md" p={4}>
      <Heading as="h2" size="md" mb={4}>
        Trending Topics
      </Heading>
      <VStack spacing={4} align="stretch">
        {topics.map((topic) => (
          <NextLink
            key={topic.id}
            href={`/dashboard/explore/${topic.id}`}
            passHref
          >
            <Link>
              <Box
                p={3}
                borderWidth={1}
                borderRadius="md"
                _hover={{ bg: "gray.50" }}
              >
                <Text fontWeight="bold">{topic.topic_name}</Text>
                <Text fontSize="sm" color="gray.600">
                  {topic.keywords.slice(0, 3).join(", ")}
                </Text>
              </Box>
            </Link>
          </NextLink>
        ))}
      </VStack>
    </Box>
  );
};

export default TrendingTopics;
