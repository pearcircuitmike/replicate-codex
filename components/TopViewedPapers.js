import React, { useEffect, useState } from "react";
import { Box, VStack, Heading, Text, Link, Spinner } from "@chakra-ui/react";
import NextLink from "next/link";

const TopViewedPapers = () => {
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await fetch("/api/dashboard/top-viewed-papers");
        if (!response.ok) throw new Error("Failed to fetch papers");
        const data = await response.json();
        setPapers(data);
      } catch (error) {
        console.error("Error fetching top viewed papers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPapers();
  }, []);

  const getViewCountText = (viewCount) => {
    if (viewCount > 1000) {
      return `${(viewCount / 1000).toFixed(1)}k views`;
    }
    return `${viewCount} views`;
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
        🏆 Most read papers
      </Heading>
      <Text color="gray.500" mb={4} fontSize="sm">
        Today&apos;s most popular summaries
      </Text>
      <VStack spacing={4} align="stretch">
        {papers.map((paper) => (
          <NextLink
            key={paper.uuid}
            href={`/papers/arxiv/${paper.slug}`}
            passHref
          >
            <Box
              p={3}
              borderWidth={1}
              borderRadius="md"
              boxShadow="sm"
              _hover={{ bg: "gray.50" }}
            >
              <Text fontWeight="bold">{paper.title}</Text>

              <Text fontSize="xs" color="gray.400" mt={1}>
                {getViewCountText(paper.view_count)}
              </Text>
            </Box>
          </NextLink>
        ))}
      </VStack>
    </Box>
  );
};

export default TopViewedPapers;
