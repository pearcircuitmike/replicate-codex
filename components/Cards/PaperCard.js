// components/Cards/PaperCard.js

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
import EmojiWithGradient from "../EmojiWithGradient";
import BookmarkButton from "../BookmarkButton";
import PaperVote from "../PaperDetailsPage/PaperVote";
const PaperCard = ({ paper, onBookmarkChange }) => {
  const {
    id,
    title,
    authors,
    generatedSummary,
    publishedDate,
    indexedDate,
    thumbnail,
    platform,
    slug,
  } = paper;

  // Clean and truncate summary
  const cleanAndTruncateSummary = (summary) => {
    if (!summary) return "No description provided";

    summary = summary
      .replace(/##\s*Overview.*?(\n|$)/gi, "")
      .replace(/##\s*Model\s*Overview.*?(\n|$)/gi, "")
      .replace(/(\*|_|`|~|#|\[.*?\]\(.*?\)|-|\>|\!.*?)/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const lines = summary.split("\n").filter(Boolean);
    const maxLines = 3;
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join(" ") + "...";
    }
    return lines.join(" ");
  };

  // Check if newly indexed (72 hours)
  const isNew = React.useMemo(() => {
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
    return new Date(indexedDate) >= seventyTwoHoursAgo;
  }, [indexedDate]);

  // Format date
  const formattedDate = React.useMemo(
    () => new Date(publishedDate).toLocaleDateString(),
    [publishedDate]
  );

  return (
    <Box
      // The entire card is a link except for the vote area
      as={Link}
      href={`/papers/${encodeURIComponent(platform)}/${encodeURIComponent(
        slug
      )}`}
      w="100%"
      h="100%"
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="base"
      display="flex"
      flexDirection="column"
      bg="white"
      overflow="hidden"
      transition="transform 0.2s ease, box-shadow 0.2s ease"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "lg",
      }}
      cursor="pointer"
      position="relative"
    >
      <Box h="250px" overflow="hidden" position="relative">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            objectFit="cover"
            w="100%"
            h="100%"
            loading="lazy"
          />
        ) : (
          <EmojiWithGradient title={title} />
        )}
      </Box>

      <Box p="15px">
        <Heading as="h3" size="sm" noOfLines={3} mb={1}>
          {isNew && (
            <Tag size="md" colorScheme="green" mr="5px">
              New!
            </Tag>
          )}
          {title}
        </Heading>
        <Text fontSize="sm" color="gray.500" noOfLines={2} mb={2}>
          {authors.join(", ")}
        </Text>
        <Text fontSize="sm" noOfLines={4}>
          {cleanAndTruncateSummary(generatedSummary)}
        </Text>
        <Text fontSize="sm" color="blue.500">
          Read more
        </Text>
      </Box>

      <Flex justify="space-between" mt="auto" mb="10px" px="15px">
        <Text fontSize="sm">{formattedDate}</Text>
      </Flex>

      {/* Floating upvote widget in bottom-right corner */}
      <Box
        position="absolute"
        bottom="10px"
        right="10px"
        bg="white"
        borderRadius="md"
        p="4px 8px"
        boxShadow="md"
        onClick={(e) => {
          // Stop card link navigation
          e.stopPropagation();
          e.preventDefault();
        }}
        cursor="default"
      >
        <Tooltip label="Upvote / downvote this paper">
          <Box>
            <PaperVote paperId={id} variant="compact" size="md" />
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default PaperCard;
