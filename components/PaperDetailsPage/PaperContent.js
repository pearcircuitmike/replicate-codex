// components/PaperDetailsPage/PaperContent.js
import React, { useRef } from "react";
import {
  Box,
  VStack,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
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
import RelatedPapers from "@/components/RelatedPapers";

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
  const externalUrl = paper.url || paper.pdfUrl;

  return (
    <Box bg="white">
      <Tabs variant="enclosed" colorScheme="blue" isLazy>
        <TabList>
          <Tab fontWeight="medium">Summary</Tab>
          <Tab fontWeight="medium">Original</Tab>
          <Tab fontWeight="medium">Related</Tab>
        </TabList>

        <TabPanels>
          {/* Summary Tab */}
          <TabPanel className="css-ljgmc-reset" p={4}>
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
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
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
          </TabPanel>

          {/* PDF Tab */}
          <TabPanel p={0}>
            {externalUrl && (
              <Box p={4}>
                <Button
                  as="a"
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  leftIcon={<ExternalLinkIcon />}
                  colorScheme="blue"
                  variant="outline"
                  size="md"
                >
                  View on arXiv
                </Button>
              </Box>
            )}
            {paper.pdfUrl && <PDFViewer url={paper.pdfUrl} />}
          </TabPanel>

          {/* Related Papers Tab */}
          <TabPanel p={0}>
            <Box p={4}>
              <RelatedPapers slug={paper.slug} platform={paper.platform} />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default PaperContent;
