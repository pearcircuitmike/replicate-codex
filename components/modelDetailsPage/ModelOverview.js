import React from "react";
import { Box, Heading, Text, Link, Tag, VStack } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import customTheme from "../../components/MarkdownTheme";
import PreviewImage from "../PreviewImage";
import { kebabToTitleCase } from "@/utils/kebabToTitleCase";
import EmojiWithGradient from "./../EmojiWithGradient";

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
          {model.generatedUseCase && (
            <>
              <Heading as="h2" size="md" mt={"1em"}>
                Use cases
              </Heading>
              <ReactMarkdown components={ChakraUIRenderer(customTheme)}>
                {model.generatedUseCase}
              </ReactMarkdown>
            </>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default ModelOverview;
