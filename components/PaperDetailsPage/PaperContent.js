// components/PaperDetailsPage/PaperContent.js

import React, { useRef } from "react";
import { Box, VStack, useToast } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math"; // for math support in Markdown
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex"; // to render math equations
import "katex/dist/katex.min.css"; // KaTeX CSS for styling math equations
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(
  () => import("@/components/PaperDetailsPage/PDFViewer"),
  {
    ssr: false,
    loading: () => <p>Loading PDF Viewer...</p>,
  }
);

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
    <Box bg="white" px={4}>
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
                remarkPlugins={[remarkGfm, remarkMath]} // Enable GFM and math support
                rehypePlugins={[rehypeRaw, rehypeKatex]} // Render raw HTML and math equations
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
      </VStack>
    </Box>
  );
}

export default PaperContent;
