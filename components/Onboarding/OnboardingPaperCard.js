import React from "react";
import { Box, Heading, Text, Image, useColorModeValue } from "@chakra-ui/react";
import UpvoteOnlyPaperVote from "./UpvoteOnlyPaperVote";
import EmojiWithGradient from "../EmojiWithGradient";

export default function OnboardingPaperCard({ paper, onVote, hasAnyVotes }) {
  const { id, title, generatedSummary, thumbnail } = paper;
  const cardBg = useColorModeValue("white", "gray.700");

  function getShortSummary(txt) {
    if (!txt) return "No summary available.";
    let s = txt
      .replace(/##\s*Overview.*?(\n|$)/gi, "")
      .replace(/##\s*Model\s*Overview.*?(\n|$)/gi, "")
      .replace(/(\*|_|`|~|#|\[.*?\]\(.*?\)|-|\>|\!.*?)/g, "")
      .replace(/\s+/g, " ")
      .trim();
    s = s.slice(0, 250);
    return s;
  }

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="base"
      bg={cardBg}
      display="flex"
      flexDirection="column"
      overflow="visible"
      position="relative"
      w="100%"
    >
      {/* Thumbnail area */}
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

      {/* Title & summary */}
      <Box p="15px">
        <Heading as="h3" size="sm" noOfLines={3} mb={3}>
          {title}
        </Heading>
        <Text fontSize="sm" noOfLines={4} color={"gray.600"}>
          {getShortSummary(generatedSummary)}
        </Text>
      </Box>

      {/* Upvote button section */}
      <Box
        display="flex"
        justifyContent="flex-end"
        p={2}
        mt="auto"
        position="relative"
        overflow="visible"
      >
        <Box position="relative" overflow="visible">
          <UpvoteOnlyPaperVote
            paperId={id}
            onVote={onVote}
            hasAnyVotes={hasAnyVotes}
          />
        </Box>
      </Box>
    </Box>
  );
}
