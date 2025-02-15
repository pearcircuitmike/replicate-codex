import React, { useRef } from "react";
import { Box, VStack, useToast } from "@chakra-ui/react";
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
}) {
  const { user } = useAuth();
  const contentRef = useRef(null);
  const toast = useToast();

  return (
    <Box bg="white" rounded="lg" p={{ base: 3, md: 6 }} maxW="100%">
      <VStack spacing={5} align="stretch">
        {!hasActiveSubscription && !viewCounts?.canViewFullArticle ? (
          <LimitMessage />
        ) : (
          <ContextualHighlighter onHighlight={onHighlight}>
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
        {paper.pdfUrl && (
          <Box mt={4}>
            <PDFViewer url={paper.pdfUrl} />
          </Box>
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
