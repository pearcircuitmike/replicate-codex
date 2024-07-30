import React from "react";
import { Box, VStack } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import customTheme from "../../components/MarkdownTheme";

const ModelOverview = ({ model }) => {
  return (
    <Box>
      <VStack alignItems="left" spacing={2}>
        <Box>
          {model?.generatedSummary ? (
            <ReactMarkdown components={ChakraUIRenderer(customTheme)}>
              {model.generatedSummary}
            </ReactMarkdown>
          ) : (
            <ReactMarkdown components={ChakraUIRenderer(customTheme)}>
              {model.description}
            </ReactMarkdown>
          )}
          <br />
        </Box>
      </VStack>
    </Box>
  );
};

export default ModelOverview;
