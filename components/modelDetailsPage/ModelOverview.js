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
        <Heading as="h1" size="2xl" style={{ wordBreak: "break-all" }}>
          {kebabToTitleCase(model?.modelName)}
        </Heading>
        <Text>
          <Link
            href={`/creators/${model?.platform}/${model?.creator}`}
            color="blue.500"
          >
            {model?.creator}
          </Link>
        </Text>
        {model?.example ? (
          <PreviewImage
            width={"100%"}
            src={model?.example}
            id={model?.id}
            modelName={model?.modelName}
          />
        ) : (
          <EmojiWithGradient title={model?.modelName} />
        )}
        <Box>
          {model?.generatedSummary ? (
            <ReactMarkdown components={ChakraUIRenderer(customTheme)}>
              {model.generatedSummary}
            </ReactMarkdown>
          ) : (
            model.description
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
        <Box>
          <Tag colorScheme="teal">{model?.tags}</Tag>
        </Box>
      </VStack>
    </Box>
  );
};

export default ModelOverview;
