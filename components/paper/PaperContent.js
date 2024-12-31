// PaperContent.js

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
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import axios from "axios";
import { FaExternalLinkAlt } from "react-icons/fa";
import dynamic from "next/dynamic";

import PaperFigures from "../PaperFigures";
import PaperTables from "../PaperTables";
import PaperVote from "../PaperVote";
import TaskTag from "@/components/TaskTag";
import LimitMessage from "@/components/LimitMessage";
import RelatedPapers from "@/components/RelatedPapers";
import LinkPreview from "./LinkPreview";
import customTheme from "@/components/MarkdownTheme";
import PDFViewer from "@/components/PDFViewer";

// Import your auth context and form
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/AuthForm";

const PaperContent = ({
  paper,
  hasActiveSubscription,
  viewCounts,
  relatedPapers,
}) => {
  const [paperTasks, setPaperTasks] = useState([]);
  const { user } = useAuth();

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

  /**
   * Split the paper content at "## Overview" and "## Plain English Explanation"
   * so we can render them separately.
   */
  const renderContent = (content) => {
    if (!content) {
      return { overview: null, restOfContent: null };
    }

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
                    ?.toLowerCase()
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

    // If we can't find those headings, return the entire content as restOfContent
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
                  ?.toLowerCase()
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

  // If user has a subscription or hasn't hit the limit yet, let them view the content
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
        {/* Paper Title and Info */}
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
            {paper.authors && paper.authors.length > 0 && (
              <Text as="span">
                {paper.authors.slice(0, 7).map((author, index) => (
                  <React.Fragment key={index}>
                    <Link
                      href={`/authors/${paper.platform}/${author}`}
                      color="blue.500"
                      _hover={{ textDecoration: "underline" }}
                      display="inline"
                    >
                      {author}
                    </Link>
                    {index < 6 && index < paper.authors.length - 1 && ", "}
                  </React.Fragment>
                ))}
                {paper.authors.length > 7 && (
                  <Text as="span">
                    {` and ${paper.authors.length - 7} more...`}
                  </Text>
                )}
              </Text>
            )}
          </Box>

          <Wrap spacing={2} mt={4}>
            {paperTasks.map((task) => (
              <WrapItem key={task.id}>
                <TaskTag task={task} initialIsFollowed={task.isFollowed} />
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        {/* Show either the LimitMessage or everything else */}
        {!canViewContent ? (
          <LimitMessage />
        ) : (
          <VStack spacing={1} align="stretch" maxW="100%">
            {/* Overview section */}
            {overview}

            {/* AuthForm shows only if the user is not logged in */}
            {!user && (
              <Box
                my={6}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                <Text align="center" fontWeight="bold" my={4} fontSize="lg">
                  Get notified when new papers like this one come out!
                </Text>
                <AuthForm signupSource="auth-form-embed" isUpgradeFlow />
              </Box>
            )}

            {/* Paper Figures (if any) */}
            {paper.paperGraphics?.length > 0 && (
              <Box my={6}>
                <PaperFigures
                  figures={paper.paperGraphics}
                  title="Paper Figures"
                />
              </Box>
            )}

            {/* Rest of the content */}
            {restOfContent}

            {/* Paper Tables (if any) */}
            {paper.paperTables?.length > 0 && (
              <Box px={6} pb={6}>
                <PaperTables tables={paper.paperTables} />
              </Box>
            )}

            {/* PDF Viewer (if available) */}
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

            {/* Paper Voting */}
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

            {/* Related Papers */}
            <Box mt={8} pt={4} borderTop="1px" borderColor="gray.200">
              <RelatedPapers relatedPapers={relatedPapers} />
            </Box>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default PaperContent;
