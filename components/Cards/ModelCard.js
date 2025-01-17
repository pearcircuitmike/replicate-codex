import React from "react";
import { Box, Heading, Text, Tag, Flex, Tooltip } from "@chakra-ui/react";
import Link from "next/link";
import NextImage from "next/image";
import removeMd from "remove-markdown";

import EmojiWithGradient from "../EmojiWithGradient";
import { formatLargeNumber } from "@/pages/api/utils/formatLargeNumber";

const ModelCard = ({ model, onBookmarkChange }) => {
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
  }

  const cleanText = (text) => {
    if (!text) return "";
    const cleanedText = removeMd(text);
    return cleanedText.replace(/^Model overview/i, "").trim();
  };

  const isNew = (indexedDate) => {
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
    return new Date(indexedDate) >= seventyTwoHoursAgo;
  };

  return (
    <Box
      as={Link}
      href={`/models/${model.platform}/${model.slug}`}
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
      transition="transform 0.2s ease, box-shadow 0.2s ease"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "lg",
      }}
      cursor="pointer"
    >
      <Box h="250px" overflow="hidden" position="relative">
        {model.example ? (
          <Box position="relative" width="100%" height="250px">
            <NextImage
              src={model.example}
              alt={model.modelName}
              fill
              style={{ objectFit: "cover" }}
            />
          </Box>
        ) : (
          <EmojiWithGradient title={model.modelName} />
        )}
        <Tooltip label="Calculated using likes, downloads, and other factors.">
          <Flex
            position="absolute"
            bottom="10px"
            right="10px"
            bg="white"
            borderRadius="md"
            p="4px 8px"
            alignItems="center"
            boxShadow="md"
          >
            <img
              src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png"
              alt="Total Score"
              style={{ width: "24px", height: "24px", marginRight: "8px" }}
            />
            <Text fontSize="md">
              {formatLargeNumber(Math.floor(model.totalScore))}
            </Text>
          </Flex>
        </Tooltip>
      </Box>
      <Box p="15px">
        <Heading
          as="h3"
          size="sm"
          noOfLines={3}
          mb={1}
          style={{ whiteSpace: "normal", wordWrap: "break-word" }}
        >
          {isNew(model.indexedDate) && (
            <Tag size="md" colorScheme="green" mr="5px">
              New!
            </Tag>
          )}
          {model.modelName}
        </Heading>
        <Text fontSize="sm" color="gray.500" noOfLines={2} mb={2}>
          {model.creator}
        </Text>
        <Text fontSize="sm" noOfLines={4}>
          {model?.generatedSummary || model?.description
            ? cleanText(model?.generatedSummary || model?.description)
            : "No description available."}
        </Text>
        <Text
          as="span"
          fontSize="sm"
          color="blue.500"
          _hover={{
            color: "blue.700",
          }}
        >
          Read more
        </Text>
      </Box>
      <Flex
        justify="space-between"
        mt="auto"
        mb="10px"
        spacing={5}
        pl="15px"
        pr="15px"
      >
        <Text fontSize="sm">
          Updated {new Date(model.lastUpdated).toLocaleDateString()}
        </Text>
      </Flex>
      {model.tags && (
        <Flex wrap="wrap" mb="10px" pl="15px" pr="15px">
          <Tag size="sm" colorScheme="blue" mr="5px" mb="5px">
            {model.tags}
          </Tag>
        </Flex>
      )}
    </Box>
  );
};

export default ModelCard;
