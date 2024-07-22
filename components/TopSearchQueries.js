import React, { useEffect, useState } from "react";
import { Box, VStack, Heading, Text, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";

const TopSearchQueries = ({ onSearchQuery }) => {
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const response = await fetch("/api/dashboard/top-search-queries");
        if (!response.ok) throw new Error("Failed to fetch search queries");
        const data = await response.json();
        setQueries(data);
      } catch (error) {
        console.error("Error fetching top search queries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQueries();
  }, []);

  const getSearchCountText = (searchCount) => {
    if (searchCount > 1000) {
      return `${(searchCount / 1000).toFixed(1)}k searches`;
    }
    return `${searchCount} searches`;
  };

  const handleQueryClick = (query) => {
    if (onSearchQuery) {
      onSearchQuery(query.search_query);
    } else {
      router.push(
        `/dashboard/discover?q=${encodeURIComponent(query.search_query)}`
      );
    }
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
        🔍 Top searches
      </Heading>
      <Text color="gray.500" mb={4} fontSize="sm">
        Today's top search terms
      </Text>
      <VStack spacing={4} align="stretch">
        {queries.map((query) => (
          <Box
            key={query.uuid}
            p={3}
            borderWidth={1}
            borderRadius="md"
            boxShadow="sm"
            _hover={{ bg: "gray.50", cursor: "pointer" }}
            onClick={() => handleQueryClick(query)}
          >
            <Text fontWeight="bold">{query.search_query}</Text>
            <Text fontSize="sm" color="gray.600">
              {query.resource_type}
            </Text>
            <Text fontSize="xs" color="gray.400">
              {getSearchCountText(query.search_count)}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default TopSearchQueries;
