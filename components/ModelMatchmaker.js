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
  Heading,
} from "@chakra-ui/react";

import supabase from "../utils/supabaseClient";
import { Configuration, OpenAIApi } from "openai";
import { useRouter } from "next/router";
import ModelCard from "@/components/ModelCard";

const openAi = new OpenAIApi(
  new Configuration({ apiKey: process.env.NEXT_PUBLIC_OPENAI_CLIENT_KEY })
);

const ModelMatchmaker = ({ initialQuery }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const queryFromURL = router.query.query;

  useEffect(() => {
    if (queryFromURL) {
      const decodedQuery = decodeURIComponent(queryFromURL);
      setSearchQuery(decodedQuery); // update the searchQuery state
      fetchData(decodedQuery);
    }
  }, [queryFromURL]);
  const fetchData = async (query) => {
    setLoading(true);

    let embedding;
    if (query) {
      const embeddingResponse = await openAi.createEmbedding({
        model: "text-embedding-ada-002",
        input: query,
      });

      embedding = embeddingResponse.data.data[0].embedding;
    }

    if (!embedding) {
      console.error("Failed to create embedding.");
      setLoading(false);
      setData([]);
      return;
    }

    const { data: modelsData, error } = await supabase.rpc("search_models", {
      query_embedding: embedding,
      similarity_threshold: 0.75,
      match_count: 10,
    });

    if (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setData([]);
      return;
    }

    setData(modelsData || []);
    setLoading(false);
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
    if (loading) return; // Return early if loading
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const getMatchScoreColor = (score) => {
    if (score <= 0.5) {
      return "red";
    } else if (score <= 0.67) {
      return "yellow";
    } else {
      return "green";
    }
  };

  return (
    <>
      <SimpleGrid mt={5} columns={{ base: 1, md: 2, lg: 2, xl: 2 }} spacing={5}>
        <Box>
          <Heading as="h2" size="sm" mb={2}>
            Search Results
          </Heading>
          <Text mb={2}>
            Results displayed below. Modify your search to try again!
          </Text>
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
        </Box>
        <Box>
          <Center>
            <Heading as="h2" size="md">
              Subscribe for a free weekly digest of new AI models.
            </Heading>
          </Center>
          <iframe
            src="https://aimodels.substack.com/embed"
            width="100%"
            height="auto"
            border="0px solid #EEE"
            bg="white"
          ></iframe>
        </Box>
      </SimpleGrid>

      {data === null ? (
        <Box mt={5} textAlign="center" color="gray.500"></Box>
      ) : loading ? (
        <Box textAlign="center">
          <Spinner size="lg" />
          <Text mt={3}>Calculating the best matches for your request...</Text>
        </Box>
      ) : data.length > 0 ? (
        <SimpleGrid
          mt={5}
          columns={{ base: 1, md: 2, lg: 4, xl: 5 }}
          spacing={5}
        >
          {data.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </SimpleGrid>
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
