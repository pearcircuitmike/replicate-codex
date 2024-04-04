// ModelCard.js
import React from "react";
import {
  Box,
  Heading,
  Text,
  Avatar,
  Link as ChakraLink,
  HStack,
  Tooltip,
} from "@chakra-ui/react";
import { DownloadIcon, RepeatIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { formatLargeNumber } from "@/utils/formatLargeNumber";
import { toTitleCase } from "@/utils/toTitleCase";
import PreviewImage from "./PreviewImage";
import EmojiWithGradient from "./EmojiWithGradient";

const ModelCard = ({ model }) => {
  if (!model) {
    return (
      <Box
        w="100%"
        h="100%"
        p={4}
        bgColor="gray.100"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text>No model data available.</Text>
      </Box>
    );
  } else {
    return (
      <Box
        w="100%"
        h="100%"
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="base"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        rounded="md"
        bg="white"
        overflow="hidden"
      >
        <Link href={`/models/${model.platform}/${model.id}`} legacyBehavior>
          <Box h="250px" overflow="hidden" position="relative">
            {model.example ? (
              <PreviewImage
                src={model.example}
                id={model.id}
                modelName={model.modelName}
              />
            ) : (
              <EmojiWithGradient title={model.modelName} />
            )}
          </Box>
        </Link>

        <Box p="15px">
          <Heading
            as="h3"
            size="md"
            noOfLines={2}
            mb={2}
            style={{ whiteSpace: "normal", wordWrap: "break-word" }}
          >
            {model.modelName}
          </Heading>

          <Text fontSize="sm" noOfLines={4}>
            {model?.generatedSummary || model?.description
              ? model?.generatedSummary || model?.description
              : "No description available."}
          </Text>
          <Text>
            <Link
              href={`/models/${model?.platform}/${model?.id}`}
              passHref
              legacyBehavior
            >
              <ChakraLink
                fontSize="sm"
                color="blue.500"
                textDecoration="underline"
              >
                Read more
              </ChakraLink>
            </Link>
          </Text>
        </Box>

        <HStack
          justify="space-between"
          mt="auto"
          mb="10px"
          spacing={5}
          pl="15px"
          pr="15px"
        >
          <Tooltip label="Cost per run, on average">
            <Text fontSize="sm">
              {model.costToRun
                ? `$${model.costToRun.toFixed(3)}/run`
                : "$-/run"}
            </Text>
          </Tooltip>
          <Tooltip
            label={model.platform === "replicate" ? "Runs" : "Downloads"}
          >
            <Text fontSize="sm">
              {model.platform === "replicate" && (
                <RepeatIcon boxSize=".8em" mr=".2em" />
              )}
              {model.platform !== "replicate" && (
                <DownloadIcon boxSize=".9em" mr=".2em" />
              )}

              {formatLargeNumber(model.runs)}
            </Text>
          </Tooltip>
          <Tooltip label="Platform">
            <Text fontSize="sm" textAlign="right">
              {toTitleCase(model.platform)}
            </Text>
          </Tooltip>
        </HStack>
      </Box>
    );
  }
};

export default ModelCard;
