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

import supabase from "../utils/supabaseClient";
import { Configuration, OpenAIApi } from "openai";
import { useRouter } from "next/router";
import ModelCard from "@/components/ModelCard";

const openAi = new OpenAIApi(
  new Configuration({ apiKey: process.env.NEXT_PUBLIC_OPENAI_CLIENT_KEY })
);

const ModelMatchmaker = ({ initialQuery }) => {
  const [loading, setLoading] = useState(false);
  const [llmLoading, setLlmLoading] = useState(false);
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
    if (loading) return; // Guard condition to prevent multiple queries

    setLoading(true);
    setLlmLoading(true);

    let embedding;
    if (query) {
      const prompt = `the user's query will be sent to you to generate an answer, and then use the answer for semantic search to find an AI model that can produce the solution to the problem or idea or use case the user is describing. Example: The user's query: 3D or point-cloud shapes or models The answer for use in semantic search:3D shapes or models are representations of objects in three-dimensional space. They can be created using various methods, including polygonal modeling, parametric modeling, and sculpting. Point cloud models, on the other hand, are collections of data points representing the external surface of an object or environment. These points are typically acquired through techniques like LiDAR scanning or photogrammetry. Point cloud models are useful for tasks such as 3D reconstruction, object recognition, and environmental mapping. Now respond similarly: The user's query: ${query}. The expanded query for use in semantic search:`;

      const gptResponse = await openAi.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      const generatedResponse = gptResponse.data.choices[0].message.content;

      const embeddingResponse = await openAi.createEmbedding({
        model: "text-embedding-ada-002",
        input: generatedResponse,
      });

      embedding = embeddingResponse.data.data[0].embedding;
    }

    setLlmLoading(false);

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
          {llmLoading ? (
            <>
              <Spinner size="lg" />
              <Text mt={3}>Generating personalized search query...</Text>
            </>
          ) : (
            <>
              <Spinner size="lg" />
              <Text mt={3}>
                Calculating the best matches for your request...
              </Text>
            </>
          )}
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
