import React, { useState, useEffect } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Textarea,
  Box,
  Button,
  Spinner,
  Tooltip,
  Container,
  Text,
  Progress,
  Tag,
  Link,
  TableContainer,
} from "@chakra-ui/react";

import { StarIcon } from "@chakra-ui/icons";
import PreviewImage from "@/components/PreviewImage";
import { toTitleCase } from "@/utils/toTitleCase";
import TruncateWithReadMore from "@/components/TruncateWithReadMore";
import supabase from "../utils/supabaseClient";
import { Configuration, OpenAIApi } from "openai";
import { formatLargeNumber } from "@/utils/formatLargeNumber";
import { useRouter } from "next/router";
import styles from "../styles/table/tableStyles.module.css";

// Initialize OpenAI client
const openAi = new OpenAIApi(
  new Configuration({ apiKey: process.env.NEXT_PUBLIC_OPENAI_CLIENT_KEY })
);

const ModelMatchmaker = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // Initial state is null
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

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
      match_count: 7,
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

  const updateURL = (query) => {
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, query },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleSearch = () => {
    updateURL(searchQuery);
    fetchData(searchQuery); // Use the current state value
  };

  const handleKeyPress = (event) => {
    if (loading) return; // Return early if loading
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const { query: urlQuery } = router.query;

    if (urlQuery) {
      setSearchQuery(urlQuery);
      fetchData(urlQuery); // Pass the URL query directly
    }
  }, [router.query]);

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
      <Container maxW="50%">
        <Box my={5} textAlign="center">
          <Textarea
            mt={4}
            placeholder="e.g., I need a model that can help upscale my images without losing clarity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button
            mt={3}
            onClick={handleSearch}
            colorScheme="blue"
            isDisabled={loading}
          >
            {loading ? "Checking 240,381 models..." : "Find my match"}
          </Button>
        </Box>
      </Container>

      {data === null ? (
        <Box mt={5} textAlign="center" color="gray.500">
          {/* <Text>You haven't searched yet! Try some of these examples:</Text>
          <br />
          <Text>"Remove the background from an image."</Text>
          <Text>"What is the best model to restore old photos?"</Text>
          <Text>"I need to increase the resolution of a picture."</Text>
          <Text>"Top models to transcribe speech into text."</Text>  */}
        </Box>
      ) : loading ? (
        <Box textAlign="center">
          <Spinner size="lg" />
          <Text mt={3}>Calculating the best matches for your request...</Text>
        </Box>
      ) : data.length > 0 ? (
        <TableContainer
          overflowY="auto"
          height="900px"
          my={5}
          borderRadius="5px"
        >
          <Table
            style={{ tableLayout: "fixed" }}
            className={styles.paginatedTable}
            size="md"
            borderRadius="5px"
          >
            <Thead
              position="sticky"
              top={0}
              bgColor="gray.300"
              zIndex={999}
              overflowY="none"
            >
              <Tr>
                <Th width="200px">Model</Th>
                <Tooltip
                  label={"What is the model all about?"}
                  placement="top-start"
                >
                  <Th width="330px">Summary</Th>
                </Tooltip>
                <Tooltip label={"What can the model do?"} placement="top-start">
                  <Th width="330px">Use case</Th>
                </Tooltip>
                <Tooltip
                  label={"How many times has it been used?"}
                  placement="top-start"
                >
                  <Th>Runs</Th>
                </Tooltip>
                <Tooltip
                  label={"How much does it cost on average to run once?"}
                  placement="top-start"
                >
                  <Th>$/Run</Th>
                </Tooltip>
                <Tooltip
                  label={"How closely does this match your use case?"}
                  placement="top-start"
                >
                  <Th>Closeness</Th>
                </Tooltip>
                <Tooltip
                  label={"How certain is the AI that this model will help you?"}
                  placement="top-start"
                >
                  <Th>Confidence</Th>
                </Tooltip>
                <Th>Try it!</Th>
              </Tr>
            </Thead>

            <Tbody>
              {data.map((item) => (
                <Tr key={item.id}>
                  <Td
                    textAlign="center"
                    width="150px"
                    style={{ whiteSpace: "normal", wordWrap: "break-word" }}
                    isTruncated
                  >
                    <Link href={`/models/${item?.platform}/${item?.id}`}>
                      <Box height="120px" overflow="hidden" my={5}>
                        <PreviewImage
                          maxH="300px"
                          src={item.example}
                          alt={`${item.modelName} example`}
                        />
                      </Box>
                    </Link>
                    {toTitleCase(item.creator)} /{" "}
                    <Link
                      href={`/models/${item?.platform}/${item?.id}`}
                      color="blue.500"
                      textDecoration="underline"
                    >
                      {toTitleCase(item.modelName)}
                    </Link>
                    <Box my={3}>
                      <Tag>{item.tags ? item.tags : "untagged"}</Tag>
                    </Box>
                  </Td>

                  <Td
                    maxW="350px"
                    style={{ whiteSpace: "normal", wordWrap: "break-word" }}
                    isTruncated
                  >
                    <TruncateWithReadMore
                      content={
                        item.generatedSummary ||
                        "We do not have a summary for this model yet!"
                      }
                      length={180}
                      hasReadMore={false}
                    />{" "}
                    <Link
                      href={`/models/${item?.platform}/${item?.id}`}
                      color="blue.500"
                      textDecoration="underline"
                    >
                      Read more
                    </Link>
                  </Td>

                  <Td
                    maxW="350px"
                    style={{ whiteSpace: "normal", wordWrap: "break-word" }}
                  >
                    <TruncateWithReadMore
                      content={
                        item.generatedUseCase
                          ? item.generatedUseCase
                          : "We do not have a use case currently indexed for this model, but based on the model metadata it may still be a good fit for you."
                      }
                      length={180}
                      hasReadMore={false}
                    />{" "}
                    <Link
                      href={`/models/${item?.platform}/${item?.id}`}
                      color="blue.500"
                      textDecoration="underline"
                    >
                      Read more
                    </Link>
                  </Td>

                  <Td>
                    {item.runs !== null ? formatLargeNumber(item.runs) : "-"}
                  </Td>
                  <Td>${item.costToRun ? item.costToRun.toFixed(2) : "-"}</Td>
                  <Td>
                    <Box width="80%">
                      <Progress
                        colorScheme={getMatchScoreColor(item.match_score)}
                        value={(item.match_score * 100).toFixed(0)}
                      />
                    </Box>
                    <Text>{item.match_score.toFixed(2)}</Text>
                  </Td>
                  <Td>
                    <Box>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          color={
                            i < Math.round(item.similarity * 5)
                              ? "gold"
                              : "gray.300"
                          }
                        />
                      ))}
                    </Box>
                    <Text>{item.similarity.toFixed(2)}</Text>
                  </Td>
                  <Td>
                    <Link href={`/models/${item?.platform}/${item?.id}`}>
                      <Button colorScheme="blue">Go!</Button>
                    </Link>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
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
