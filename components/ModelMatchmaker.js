import React, { useState, useEffect } from "react";
import {
  Box,
  Textarea,
  Button,
  Spinner,
  Text,
  Container,
  SimpleGrid,
  Center,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import ModelCard from "@/components/ModelCard";

const ModelMatchmaker = ({ initialQuery }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsToShow, setItemsToShow] = useState(5);
  const router = useRouter();
  const queryFromURL = router.query.query;

  useEffect(() => {
    if (queryFromURL) {
      const decodedQuery = decodeURIComponent(queryFromURL);
      setSearchQuery(decodedQuery);
      fetchData(decodedQuery);
    }
  }, [queryFromURL]);

  const fetchData = async (query) => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/search-models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let queryToUse = searchQuery.trim();
    if (queryToUse === "") {
      queryToUse = "Show me some random AI models";
      setSearchQuery(queryToUse);
    }
    router.push(`/results?query=${encodeURIComponent(queryToUse)}`);
  };

  const handleKeyPress = (event) => {
    if (loading) return;
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleViewMore = () => {
    setItemsToShow(itemsToShow + 10);
  };

  return (
    <>
      <Textarea
        fullWidth
        placeholder="e.g., I need a model that can help upscale my images without losing clarity..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        width="100%"
        margin="auto"
      />
      <Button
        mt={3}
        onClick={handleSearch}
        colorScheme="blue"
        isDisabled={loading}
      >
        {loading ? "Checking 240,381 models..." : "Find my AI model"}
      </Button>

      {data === null ? (
        <Box mt={5} textAlign="center" color="gray.500"></Box>
      ) : loading ? (
        <Box textAlign="center">
          <Spinner size="lg" />
          <Text mt={3}>Searching for the best matches...</Text>
        </Box>
      ) : data.length > 0 ? (
        <>
          <SimpleGrid
            mt={5}
            columns={{ base: 1, md: 2, lg: 4, xl: 5 }}
            spacing={5}
          >
            {data.slice(0, itemsToShow).map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </SimpleGrid>
          {itemsToShow < data.length && (
            <Center mt={5}>
              <Button onClick={handleViewMore}>View More</Button>
            </Center>
          )}
        </>
      ) : (
        <Box mt={5} textAlign="center">
          <Text>
            No results found. Please try a broader term or check for typos.
          </Text>
        </Box>
      )}
    </>
  );
};

export default ModelMatchmaker;
