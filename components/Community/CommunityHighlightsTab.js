// components/Community/CommunityHighlightsTab.jsx

import React from "react";
import {
  Box,
  Flex,
  Avatar,
  Text,
  Heading,
  Link as ChakraLink,
} from "@chakra-ui/react";
import NextLink from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const CommunityHighlightsTab = ({ highlights = [] }) => {
  if (highlights.length === 0) {
    return <Text>No highlights yet. Start highlighting!</Text>;
  }

  // Adjust as needed for how much prefix/suffix to keep
  const prefixMaxLen = 30;
  const suffixMaxLen = 30;

  return (
    <Box>
      {highlights.map((highlight) => {
        // Truncate prefix from left
        let prefixTruncated = highlight.prefix || "";
        if (prefixTruncated.length > prefixMaxLen) {
          prefixTruncated = "..." + prefixTruncated.slice(-prefixMaxLen);
        }

        // Truncate suffix from right
        let suffixTruncated = highlight.suffix || "";
        if (suffixTruncated.length > suffixMaxLen) {
          suffixTruncated = suffixTruncated.slice(0, suffixMaxLen) + "...";
        }

        return (
          <Box
            key={highlight.id}
            mb={4}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            bg="white"
            boxShadow="sm"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Flex align="center">
                <Avatar
                  size="sm"
                  src={highlight.userProfile?.avatar_url || ""}
                  name={highlight.userProfile?.full_name || "User"}
                  mr={2}
                />
                <Heading as="h4" size="sm" isTruncated>
                  {highlight.userProfile?.full_name || "Anonymous"}
                </Heading>
              </Flex>

              <Text fontSize="sm" color="gray.500">
                {dayjs(highlight.created_at).fromNow()}
              </Text>
            </Flex>

            {/* Highlighted snippet */}
            <Text fontSize="sm" mb={3}>
              {prefixTruncated && (
                <Text as="span" color="gray.600" mr={1}>
                  {prefixTruncated}
                </Text>
              )}
              <Text as="span" fontWeight="bold" mr={1}>
                {highlight.quote}
              </Text>
              {suffixTruncated && (
                <Text as="span" color="gray.600">
                  {suffixTruncated}
                </Text>
              )}
            </Text>

            {/* Link to Paper (with an emoji icon) */}
            {highlight.arxivPapersData && (
              <Flex align="center">
                <Text fontSize="sm" color="blue.600" mr={2}>
                  📄
                </Text>
                <NextLink
                  href={`/papers/${highlight.arxivPapersData.platform}/${highlight.arxivPapersData.slug}`}
                  passHref
                >
                  <ChakraLink color="blue.600" fontSize="sm">
                    {highlight.arxivPapersData.title}
                  </ChakraLink>
                </NextLink>
              </Flex>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default CommunityHighlightsTab;
