// components/paper/PaperContent.js

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
  Grid,
  GridItem,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import axios from "axios";
import { FaExternalLinkAlt } from "react-icons/fa";
import dynamic from "next/dynamic";

const RelatedPapers = dynamic(() => import("@/components/RelatedPapers"));
const PDFViewer = dynamic(
  () => import("@/components/PaperDetailsPage/PDFViewer"),
  {
    ssr: false,
    loading: () => <p>Loading PDF Viewer...</p>,
  }
);

import PaperFigures from "./PaperFigures";
import PaperTables from "./PaperTables";
import PaperVote from "./PaperVote";
import TaskTag from "@/components/TaskTag";
import LimitMessage from "@/components/LimitMessage";
import customTheme from "@/components/MarkdownTheme";
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
          const response = await axios.get("/api/tasks/get-followed-tasks", {
            params: { paperId: paper.id },
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

  // Splits "## Overview" and "## Plain English Explanation" if present
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
          <Box bg="gray.100" rounded="lg" p={{ base: 4, md: 6 }} maxW="100%">
            <ReactMarkdown
              components={ChakraUIRenderer({
                ...customTheme,
                h2: (props) => <Heading {...props} as="h2" size="lg" mb={4} />,
                p: (props) => (
                  <Text {...props} mb="1.2em" wordBreak="break-word" />
                ),
              })}
            >
              {overview}
            </ReactMarkdown>
          </Box>
        ),
        restOfContent: (
          <Box maxW="100%">
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
                      textOverflow="ellipsis"
                    />
                  );
                },
                p: (props) => (
                  <Text {...props} mb="1.2em" wordBreak="break-word" />
                ),
                a: ({ href, children }) => (
                  <Link
                    href={href}
                    color="blue.500"
                    _hover={{ textDecoration: "underline" }}
                  >
                    {children}
                  </Link>
                ),
              })}
            >
              {restOfContent}
            </ReactMarkdown>
          </Box>
        ),
      };
    }

    // No headings found, return all at once
    return {
      overview: null,
      restOfContent: (
        <Box maxW="100%">
          <ReactMarkdown
            components={ChakraUIRenderer({
              ...customTheme,
              a: ({ href, children }) => (
                <Link
                  href={href}
                  color="blue.500"
                  _hover={{ textDecoration: "underline" }}
                >
                  {children}
                </Link>
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
                    textOverflow="ellipsis"
                  />
                );
              },
              p: (props) => <Text {...props} wordBreak="break-word" />,
            })}
          >
            {content}
          </ReactMarkdown>
        </Box>
      ),
    };
  };

  const { overview, restOfContent } = renderContent(paper.generatedSummary);

  // Only paid or under-free-limit can see the full text
  const canViewContent =
    hasActiveSubscription || viewCounts?.canViewFullArticle;

  return (
    <Box bg="white" rounded="lg" p={{ base: 3, md: 6 }} maxW="100%">
      <VStack spacing={5} align="stretch">
        {/* Header with up/down vote to the left, paper details on the right */}
        <Box mb={5}>
          <Grid templateColumns="auto 1fr" gap={4}>
            {/* Left column: up/down vote */}
            <GridItem>
              <PaperVote paperId={paper.id} variant="vertical" size="md" />
            </GridItem>

            {/* Right column: paper title, authors, tasks */}
            <GridItem>
              <Heading as="h1" size="lg" noOfLines={2}>
                {paper.title}
              </Heading>

              <Box fontSize="sm" color="gray.600" mt={1}>
                <Text as="span">
                  Published {new Date(paper.publishedDate).toLocaleDateString()}{" "}
                  by{" "}
                </Text>
                {paper.authors?.slice(0, 7).map((author, idx) => (
                  <React.Fragment key={author}>
                    <Link
                      href={`/authors/${paper.platform}/${author}`}
                      color="blue.500"
                      _hover={{ textDecoration: "underline" }}
                    >
                      {author}
                    </Link>
                    {idx < 6 && idx < paper.authors.length - 1 && ", "}
                  </React.Fragment>
                ))}
                {paper.authors?.length > 7 && (
                  <Text as="span">
                    {" and "}
                    {paper.authors.length - 7} more...
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
            </GridItem>
          </Grid>
        </Box>

        {/* Paywall check */}
        {!canViewContent ? (
          <LimitMessage />
        ) : (
          <VStack spacing={1} align="stretch">
            {/* Overview section */}
            {overview}

            {/* Show signup form if user is not logged in */}
            {!user && (
              <Box my={6} textAlign="center">
                <Text fontWeight="bold" my={4} fontSize="lg">
                  Get notified when new papers like this one come out!
                </Text>
                <AuthForm signupSource="auth-form-embed" isUpgradeFlow />
              </Box>
            )}

            {/* Paper Figures */}
            {paper.paperGraphics?.length > 0 && (
              <Box my={6}>
                <PaperFigures
                  figures={paper.paperGraphics}
                  title="Paper Figures"
                />
              </Box>
            )}

            {/* Main summary/content */}
            {restOfContent}

            {/* Tables */}
            {paper.paperTables?.length > 0 && (
              <Box px={6} pb={6}>
                <PaperTables tables={paper.paperTables} />
              </Box>
            )}

            {/* PDF Viewer */}
            {paper.pdfUrl && (
              <Box my={6}>
                <Heading as="h2" id="full-paper" my={5} size="lg">
                  Full paper
                </Heading>
                <Text>
                  Read original:{" "}
                  <Link
                    href={`https://arxiv.org/abs/${paper.arxivId}`}
                    isExternal
                    color="blue.500"
                    display="inline-flex"
                    alignItems="center"
                    _hover={{ textDecoration: "underline" }}
                  >
                    <Text as="span" textDecoration="underline">
                      arXiv:{paper.arxivId}
                    </Text>
                    <Icon as={FaExternalLinkAlt} ml={1} boxSize={3} />
                  </Link>
                </Text>
                <Box mt={5}>
                  <PDFViewer url={paper.pdfUrl} />
                </Box>
              </Box>
            )}

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
