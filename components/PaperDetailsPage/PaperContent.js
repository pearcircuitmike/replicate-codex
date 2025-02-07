// components/PaperContent.jsx
import React, { useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Link,
  VStack,
  Grid,
  GridItem,
  useToast,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import rehypeRaw from "rehype-raw";
import dynamic from "next/dynamic";

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
import ContextualHighlighter from "../ContextualHighlighter";
import InjectedHighlights from "../InjectedHighlights";

function PaperContent({
  paper,
  hasActiveSubscription,
  viewCounts,
  highlights,
  onHighlightClick,
  onHighlight,
  onComment,
}) {
  const { user } = useAuth();
  const contentRef = useRef(null);
  const toast = useToast();

  return (
    <Box bg="white" rounded="lg" p={{ base: 3, md: 6 }} maxW="100%">
      <VStack spacing={5} align="stretch">
        <Box mb={5}>
          <Grid templateColumns="auto 1fr" gap={4}>
            <GridItem>
              <PaperVote paperId={paper.id} variant="vertical" size="md" />
            </GridItem>
            <GridItem>
              <Heading as="h1" size="lg">
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
        {!hasActiveSubscription && !viewCounts?.canViewFullArticle ? (
          <LimitMessage />
        ) : (
          <ContextualHighlighter
            onHighlight={onHighlight}
            onComment={onComment}
          >
            <Box
              ref={contentRef}
              position="relative"
              className="markdown-content"
            >
              <ReactMarkdown
                components={ChakraUIRenderer(customTheme)}
                rehypePlugins={[rehypeRaw]}
              >
                {paper.generatedSummary}
              </ReactMarkdown>
              <InjectedHighlights
                containerRef={contentRef}
                highlights={highlights}
                onHighlightClick={onHighlightClick}
              />
            </Box>
          </ContextualHighlighter>
        )}
        {paper.figures && paper.figures.length > 0 && (
          <PaperFigures figures={paper.figures} />
        )}
        {paper.tables && paper.tables.length > 0 && (
          <PaperTables tables={paper.tables} />
        )}
      </VStack>
    </Box>
  );
}

export default PaperContent;
