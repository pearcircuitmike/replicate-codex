import React from "react";
import { Box, Heading, Text, Avatar, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import { formatLargeNumber } from "@/utils/formatLargeNumber";
import { getMedalEmoji } from "@/utils/getMedalEmoji.js";

const CreatorCard = ({ creator }) => {
  if (!creator) {
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        w="100%"
        boxShadow="base"
        p={4}
        height="100%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Text>No creator data available.</Text>
      </Box>
    );
  } else {
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        w="100%"
        boxShadow="base"
        p={4}
        height="100%"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box textAlign="center">
          <Avatar
            src={`https://github.com/${creator.creator}.png`}
            size="2xl"
            mb={3}
          />
          <Heading as="h2" size="md" isTruncated mb={2}>
            {creator.creator}
          </Heading>
          <Text>
            Rank: {formatLargeNumber(Math.floor(creator.creatorRank))}
          </Text>
          <Text>
            Score: {formatLargeNumber(Math.floor(creator.totalCreatorScore))}
          </Text>
        </Box>
        <Flex justifyContent="center" mt={3}>
          <Link
            href={`/creators/${creator.platform}/${creator.creator}`}
            passHref
            legacyBehavior
          >
            <Button size="sm" colorScheme="blue">
              View profile
            </Button>
          </Link>
        </Flex>
      </Box>
    );
  }
};

export default CreatorCard;
