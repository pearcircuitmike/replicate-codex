// components/PaperMatchmaker.js
import React, { useState } from "react";
import {
  Box,
  Textarea,
  Button,
  Spinner,
  Text,
  SimpleGrid,
  Center,
} from "@chakra-ui/react";
import { Configuration, OpenAIApi } from "openai";
import { fetchPapersWithEmbeddings } from "../utils/fetchPapersWithEmbeddings";
import PaperCard from "./PaperCard";

const openAi = new OpenAIApi(
  new Configuration({ apiKey: process.env.NEXT_PUBLIC_OPENAI_CLIENT_KEY })
);

const PaperMatchmaker = () => {
  const [loading, setLoading] = useState(false);
  const [llmLoading, setLlmLoading] = useState(false);
  const [papers, setPapers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsToShow, setItemsToShow] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPapers = async (query) => {
    setLoading(true);
    setLlmLoading(true);

    const prompt = `the user's query will be sent to you to generate an answer, and then use the answer for 
    semantic search to find an AI research paper that can produce the solution to the problem or idea or use 
    case the user is describing. Now respond similarly: The user's query: ${query}. The expanded hypothetical research paper for use in semantic search:`;

    const gptResponse = await openAi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const generatedResponse = gptResponse.data.choices[0].message.content;

    const embeddingResponse = await openAi.createEmbedding({
      model: "text-embedding-ada-002",
      input: generatedResponse,
    });

    const embedding = embeddingResponse.data.data[0].embedding;

    setLlmLoading(false);

    const { papers: matchedPapers, totalCount } =
      await fetchPapersWithEmbeddings(embedding, 0.75, itemsToShow);

    setPapers(matchedPapers);
    setTotalCount(totalCount);
    setLoading(false);
  };

  const handleSearch = () => {
    fetchPapers(searchQuery);
  };

  const handleKeyPress = (event) => {
    if (loading) return;
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleViewMore = () => {
    setItemsToShow(itemsToShow + 10);
    fetchPapers(searchQuery);
  };

  return (
    <>
      <Textarea
        placeholder="Search for papers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <Button mt={3} onClick={handleSearch} isDisabled={loading}>
        {loading ? "Searching..." : "Search"}
      </Button>

      {loading ? (
        <Box textAlign="center">
          {llmLoading ? (
            <>
              <Spinner size="lg" />
              <Text mt={3}>Generating personalized search query...</Text>
            </>
          ) : (
            <>
              <Spinner size="lg" />
              <Text mt={3}>Searching papers...</Text>
            </>
          )}
        </Box>
      ) : papers.length > 0 ? (
        <>
          <SimpleGrid mt={5} columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            {papers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </SimpleGrid>
          {itemsToShow < totalCount && (
            <Center mt={5}>
              <Button onClick={handleViewMore}>View More</Button>
            </Center>
          )}
        </>
      ) : (
        <Box mt={5} textAlign="center">
          <Text>No papers found. Please try a different search.</Text>
        </Box>
      )}
    </>
  );
};

export default PaperMatchmaker;
