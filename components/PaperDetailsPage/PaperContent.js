// components/PaperDetailsPage/PaperContent.js
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Link,
  Icon,
  VStack,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import rehypeRaw from "rehype-raw";
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
import LimitMessage from "@/components/LimitMessage";
import customTheme from "@/components/MarkdownTheme";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/AuthForm";
import TextHighlighter from "../TextHighlighter";
import InjectedHighlights from "../InjectedHighlights";
import HighlightSidebar from "../HighlightSidebar";

function PaperContent({
  paper,
  hasActiveSubscription,
  viewCounts,
  relatedPapers,
}) {
  const { user } = useAuth();
  const [prepopulatedComment, setPrepopulatedComment] = useState("");
  const [highlights, setHighlights] = useState([]);
  const contentRef = useRef(null);

  function renderContent(content) {
    if (!content) return { overview: null, restOfContent: null };
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
    return {
      overview: null,
      restOfContent: (
        <Box maxW="100%">
          <ReactMarkdown components={ChakraUIRenderer(customTheme)}>
            {content}
          </ReactMarkdown>
        </Box>
      ),
    };
  }

  const { overview, restOfContent } = renderContent(paper.generatedSummary);
  const canViewContent =
    hasActiveSubscription || viewCounts?.canViewFullArticle;

  useEffect(() => {
    async function fetchHighlights() {
      const { data, error } = await (
        await import("@/pages/api/utils/supabaseClient")
      ).default
        .from("highlights")
        .select(
          `
          *,
          public_profile_info:profiles (id, full_name, avatar_url, username)
        `
        )
        .eq("paper_id", paper.id)
        .order("start_offset", { ascending: true });
      if (error) {
        console.error("Error fetching highlights:", error);
      } else {
        setHighlights(data);
      }
    }
    fetchHighlights();
  }, [paper.id]);

  const handleNewHighlight = (newHighlight) => {
    setHighlights((prev) => [...prev, newHighlight]);
  };

  const handlePrepopulateComment = (selectedText) => {
    setPrepopulatedComment(selectedText);
  };

  return (
    <Box bg="white" rounded="lg" p={{ base: 3, md: 6 }} maxW="100%">
      <VStack spacing={5} align="stretch">
        {/* Header */}
        <Box mb={5}>
          <Grid templateColumns="auto 1fr" gap={4}>
            <GridItem>
              <PaperVote paperId={paper.id} variant="vertical" size="md" />
            </GridItem>
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
            </GridItem>
          </Grid>
        </Box>
        {!canViewContent ? (
          <LimitMessage />
        ) : (
          <Grid templateColumns={{ base: "1fr", lg: "1fr 250px" }} gap={6}>
            <GridItem>
              <TextHighlighter
                paperId={paper.id}
                user={user}
                onComment={handlePrepopulateComment}
                onNewHighlight={handleNewHighlight}
              >
                <Box position="relative" ref={contentRef}>
                  <ReactMarkdown
                    components={ChakraUIRenderer(customTheme)}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {paper.generatedSummary}
                  </ReactMarkdown>
                  <InjectedHighlights
                    containerRef={contentRef}
                    highlights={highlights}
                  />
                </Box>
              </TextHighlighter>
            </GridItem>
            <GridItem>
              <HighlightSidebar
                containerRef={contentRef}
                highlights={highlights}
              />
            </GridItem>
          </Grid>
        )}
      </VStack>
    </Box>
  );
}

export default PaperContent;
