// ModelCard.js
import React from "react";
import {
  Box,
  Heading,
  Text,
  Link as ChakraLink,
  Image,
  Tag,
  Flex,
  Tooltip,
} from "@chakra-ui/react";
import Link from "next/link";
import { toTitleCase } from "@/pages/api/utils/toTitleCase";
import PreviewImage from "./PreviewImage";
import EmojiWithGradient from "./EmojiWithGradient";
import removeMd from "remove-markdown";
import { formatLargeNumber } from "@/pages/api/utils/formatLargeNumber";
import BookmarkButton from "./BookmarkButton";

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
  } else {
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
        <Link href={`/models/${model.platform}/${model.slug}`} legacyBehavior>
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
            {isNew(model.indexedDate) && (
              <Tag size="md" colorScheme="green" mr="5px">
                New!
              </Tag>
            )}
            {model.modelName}
          </Heading>
          <Text fontSize="sm" color="gray.500" noOfLines={2} mb={4}>
            <Link
              href={`/creators/${encodeURIComponent(
                model.platform
              )}/${encodeURIComponent(model.creator)}`}
            >
              {model.creator}
            </Link>
          </Text>
          <Flex alignItems="center" mb={4}>
            <Tooltip label="Calculated based on factors such as likes, downloads, etc">
              <Image
                src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png"
                alt="Total Score"
                boxSize="24px"
                mr={2}
              />
            </Tooltip>
            <Text fontSize="md">
              {formatLargeNumber(Math.floor(model.totalScore))}
            </Text>
          </Flex>
          <Text fontSize="sm" noOfLines={4}>
            {model?.generatedSummary || model?.description
              ? cleanText(model?.generatedSummary || model?.description)
              : "No description available."}
          </Text>
          <Text>
            <Link
              href={`/models/${model.platform}/${model.slug}`}
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
        <Flex justify="space-between" mt="auto" mb="10px" pl="15px" pr="15px">
          <Text fontSize="sm">
            Updated {new Date(model.lastUpdated).toLocaleDateString()}
          </Text>
        </Flex>
        <Flex wrap="wrap" mb="10px" pl="15px" pr="15px">
          {model.tags && (
            <Link
              href={{
                pathname: "/models",
                query: { selectedTag: model.tags },
              }}
              passHref
            >
              <Tag
                as="a"
                size="sm"
                colorScheme="blue"
                mr="5px"
                mb="5px"
                cursor="pointer"
              >
                {model.tags}
              </Tag>
            </Link>
          )}
        </Flex>
        <BookmarkButton
          resourceType="model"
          resourceId={model.id}
          onBookmarkChange={onBookmarkChange}
        />
      </Box>
    );
  }
};

export default ModelCard;
