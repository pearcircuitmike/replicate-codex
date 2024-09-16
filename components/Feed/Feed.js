import React, { useEffect, useState } from "react";
import { Box, VStack, Spinner, SimpleGrid, Text } from "@chakra-ui/react";

import ModelCard from "../ModelCard";
import PaperCard from "../PaperCard";

const Feed = ({
  resourceType,
  fetchParams,
  updateResultCount,
  isSearching,
}) => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        let endpoint = "";
        if (resourceType === "paper") {
          endpoint = "/api/search/semantic-search-papers";
        } else if (resourceType === "model") {
          endpoint = "/api/search/semantic-search-models";
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: fetchParams.searchValue,
            similarityThreshold: 0.7,
            matchCount: 20,
            timeRange: fetchParams.timeRange,
          }),
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const { data } = await response.json();
        setResults(data);
        updateResultCount(
          resourceType === "paper" ? "papers" : "models",
          data.length
        );
      } catch (error) {
        console.error("Error fetching feed results:", error);
        setResults([]);
        updateResultCount(resourceType === "paper" ? "papers" : "models", 0);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isSearching) {
      fetchResults();
    }
  }, [fetchParams, resourceType, updateResultCount, isSearching]);

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (results.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text>No {resourceType === "paper" ? "papers" : "models"} found.</Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={[1, 2, 3]} spacing={6}>
      {results.map((item) =>
        resourceType === "paper" ? (
          <PaperCard key={item.id} paper={item} />
        ) : (
          <ModelCard key={item.id} model={item} />
        )
      )}
    </SimpleGrid>
  );
};

export default Feed;
