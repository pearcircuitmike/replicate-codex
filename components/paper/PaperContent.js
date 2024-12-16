import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Link,
  Icon,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import axios from "axios";
import PaperFigures from "../PaperFigures";
import PaperTables from "../PaperTables";
import PaperVote from "../PaperVote";
import TaskTag from "@/components/TaskTag";
import LimitMessage from "@/components/LimitMessage";
import PDFViewer from "@/components/PDFViewer";
import customTheme from "@/components/MarkdownTheme";
import LinkPreview from "./LinkPreview";

const PaperContent = ({ paper, hasActiveSubscription, viewCounts }) => {
  const [paperTasks, setPaperTasks] = useState([]);

  useEffect(() => {
    const fetchPaperTasks = async () => {
      if (paper?.id) {
        try {
          const response = await axios.get(`/api/tasks/get-followed-tasks`, {
            params: {
              paperId: paper.id,
            },
          });

          if (!response.data || !response.data.tasks) {
            throw new Error("Failed to fetch paper tasks");
          }

          setPaperTasks(response.data.tasks);
        } catch (error) {
          console.error("Error fetching paper tasks:", error);
        }
      }
    };

    fetchPaperTasks();
  }, [paper?.id]);

  const renderContent = (content) => {
    if (!content) return { overview: null, restOfContent: null };

    const overviewStart = content.indexOf("## Overview");
    const overviewEnd = content.indexOf("## Plain English Explanation");

    if (overviewStart !== -1 && overviewEnd !== -1) {
      const overview = content.slice(overviewStart, overviewEnd);
      const restOfContent =
        content.slice(0, overviewStart) + content.slice(overviewEnd);

      return {
        overview: (
          <Box
            id="overview"
            bg="gray.100"
            rounded="lg"
            p={{ base: 4, md: 6 }}
            maxW="100%"
            overflow="hidden"
          >
            <ReactMarkdown
              components={ChakraUIRenderer({
                ...customTheme,
                h2: (props) => (
                  <Heading
                    {...props}
                    id="overview"
                    as="h2"
                    size="lg"
                    mb={4}
                    maxW="100%"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  />
                ),
                p: (props) => (
                  <Text
                    {...props}
                    maxW="100%"
                    overflow="hidden"
                    wordBreak="break-word"
                    mb="1.2em"
                  />
                ),
              })}
            >
              {overview}
            </ReactMarkdown>
          </Box>
        ),
        restOfContent: (
          <Box maxW="100%" overflow="hidden">
            <ReactMarkdown
              components={ChakraUIRenderer({
                ...customTheme,
                h2: (props) => {
                  const id = props.children[0]
                    .toLowerCase()
                    .replace(/[^a-zA-Z0-9]+/g, "-");
                  return (
                    <Heading
                      {...props}
                      id={id}
                      as="h2"
                      size="lg"
                      mt={8}
                      mb={4}
                      maxW="100%"
                      overflow="hidden"
                      textOverflow="ellipsis"
                    />
                  );
                },
                p: (props) => (
                  <Text
                    {...props}
                    maxW="100%"
                    overflow="hidden"
                    wordBreak="break-word"
                    mb="1.2em"
                  />
                ),
                a: ({ href, children }) => (
                  <LinkPreview href={href}>{children}</LinkPreview>
                ),
                pre: (props) => (
                  <Box
                    as="pre"
                    maxW="100%"
                    overflow="auto"
                    whiteSpace="pre-wrap"
                    {...props}
                  />
                ),
              })}
            >
              {restOfContent}
            </ReactMarkdown>
          </Box>
        ),
      };
    }

    return {
      overview: null,
      restOfContent: (
        <Box maxW="100%" overflow="hidden">
          <ReactMarkdown
            components={ChakraUIRenderer({
              ...customTheme,
              a: ({ href, children }) => (
                <LinkPreview href={href}>{children}</LinkPreview>
              ),

              h2: (props) => {
                const id = props.children[0]
                  .toLowerCase()
                  .replace(/[^a-zA-Z0-9]+/g, "-");
                return (
                  <Heading
                    {...props}
                    id={id}
                    as="h2"
                    size="lg"
                    mt={8}
                    mb={4}
                    maxW="100%"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  />
                );
              },
              p: (props) => (
                <Text
                  {...props}
                  maxW="100%"
                  overflow="hidden"
                  wordBreak="break-word"
                />
              ),
            })}
          >
            {content}
          </ReactMarkdown>
        </Box>
      ),
    };
  };

  const { overview, restOfContent } = renderContent(paper.generatedSummary);
  const canViewContent =
    hasActiveSubscription || viewCounts?.canViewFullArticle;

  return (
    <Box
      bg="white"
      rounded="lg"
      p={{ base: 3, md: 6 }}
      mb={{ base: "40vh", lg: "60vh" }}
      maxW="100%"
      overflow="hidden"
    >
      <VStack spacing={5} align="stretch" maxW="100%">
        <Box mb={5} maxW="100%">
          <Heading
            as="h1"
            size="lg"
            mb={4}
            maxW="100%"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {paper.title}
          </Heading>

          <Box fontSize="sm" color="gray.600" maxW="100%" overflow="hidden">
            <Text as="span">
              Published {new Date(paper.publishedDate).toLocaleDateString()} by{" "}
            </Text>
            {paper.authors?.map((author, index) => (
              <React.Fragment key={index}>
                <Link
                  href={`/authors/${paper.platform}/${author}`}
                  color="blue.500"
                  _hover={{ textDecoration: "underline" }}
                  display="inline"
                >
                  {author}
                </Link>
                {index < paper.authors.length - 1 && ", "}
              </React.Fragment>
            ))}
          </Box>

          <Wrap spacing={2} mt={4}>
            {paperTasks.map((task) => (
              <WrapItem key={task.id}>
                <TaskTag task={task} initialIsFollowed={task.isFollowed} />
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        {!canViewContent ? (
          <LimitMessage />
        ) : (
          <VStack spacing={1} align="stretch" maxW="100%">
            {overview}

            {paper.paperGraphics?.length > 0 && (
              <Box my={6}>
                <PaperFigures
                  figures={paper.paperGraphics}
                  title="Paper Figures"
                />
              </Box>
            )}

            {restOfContent}

            {paper.paperTables?.length > 0 && (
              <Box px={6} pb={6}>
                <PaperTables tables={paper.paperTables} />
              </Box>
            )}

            {paper.pdfUrl && (
              <Box maxW="100%" overflow="hidden" my={6}>
                <Heading as="h2" id="full-paper" my={5} size="lg">
                  Full paper
                </Heading>
                <PDFViewer url={paper.pdfUrl} />
                <Text mt={5}>
                  Read original:{" "}
                  <Link
                    href={`https://arxiv.org/abs/${paper.arxivId}`}
                    isExternal
                    color="blue.500"
                    display="inline-flex"
                    alignItems="center"
                  >
                    <Text as="span" textDecoration="underline">
                      arXiv:{paper.arxivId}
                    </Text>
                    <Icon as={FaExternalLinkAlt} ml={1} boxSize={3} />
                  </Link>
                </Text>
              </Box>
            )}

            <Box
              mt={8}
              pt={4}
              borderTop="1px"
              borderColor="gray.200"
              maxW="100%"
              overflow="hidden"
            >
              <PaperVote paperId={paper.id} />
            </Box>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default PaperContent;
