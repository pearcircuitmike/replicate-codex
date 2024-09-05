import React, { useState } from "react";
import {
  Input,
  Button,
  Box,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import { trackEvent } from "../pages/api/utils/analytics-util";

const SemanticSearchBar = ({
  searchValue,
  setSearchValue,
  onSearchSubmit,
  placeholder,
  resourceType,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      // Step 1: Expand the query
      const expansionResponse = await fetch("/api/search/query-expander", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchValue }),
      });

      if (!expansionResponse.ok) {
        throw new Error("Failed to expand query");
      }

      const { expandedQuery } = await expansionResponse.json();
      console.log("Expanded query:", expandedQuery);

      // Step 2: Get embedding for the expanded query
      const embeddingResponse = await fetch("/api/search/create-embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: expandedQuery.join(" ") }),
      });

      if (!embeddingResponse.ok) {
        throw new Error("Failed to create embedding");
      }

      const { embedding } = await embeddingResponse.json();

      // Step 3: Perform semantic search
      const searchResponse = await fetch("/api/search/semantic-search-papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embedding,
          similarityThreshold: 0.7,
          matchCount: 10,
        }),
      });

      if (!searchResponse.ok) {
        throw new Error("Search failed");
      }

      const { data } = await searchResponse.json();
      onSearchSubmit(data);
      trackEvent("semantic_search", {
        resource_type: resourceType,
        query: searchValue,
        expanded_query: expandedQuery,
      });
    } catch (error) {
      console.error("Error in semantic search:", error);
      toast({
        title: "Search failed",
        description:
          error.message ||
          "There was an error processing your search. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      alignItems="center"
      width="100%"
    >
      <Input
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        mb={isMobile ? 2 : 0}
        flex={isMobile ? "none" : "1"}
        mr={isMobile ? 0 : 2}
        width={isMobile ? "100%" : "auto"}
      />
      <Button
        colorScheme="blue"
        onClick={handleSearch}
        width={isMobile ? "100%" : "auto"}
        flexShrink={0}
        isLoading={isLoading}
      >
        Search
      </Button>
    </Box>
  );
};

export default SemanticSearchBar;
