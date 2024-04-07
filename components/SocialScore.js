// SocialScore.js
import React from "react";
import { Flex, Image, Link, Text, Tooltip, Box } from "@chakra-ui/react";

const SocialScore = ({ paper }) => {
  return (
    <Flex align="center" mb={3}>
      <Tooltip
        label={
          <Flex align="center">
            <Image
              borderRadius="full"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Y_Combinator_logo.svg/1200px-Y_Combinator_logo.svg.png"
              alt="YC"
              w="20px"
              h="20px"
              mr={2}
            />
            <Text>Number of upvotes on Hacker News</Text>
          </Flex>
        }
      >
        <Flex align="center" cursor="default">
          <Box>
            <Image
              borderRadius="full"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Y_Combinator_logo.svg/1200px-Y_Combinator_logo.svg.png"
              alt="YC"
              w="20px"
              h="20px"
              mr={2}
            />
          </Box>
          <Text fontSize="sm" mr={4}>
            {paper.hackerNewsScore || 0}
          </Text>
        </Flex>
      </Tooltip>
      <Tooltip
        label={
          <Flex align="center">
            <Image
              borderRadius="full"
              src="https://cdn3.iconfinder.com/data/icons/2018-social-media-logotypes/1000/2018_social_media_popular_app_logo_reddit-512.png"
              alt="Reddit"
              w="20px"
              h="20px"
              mr={2}
            />
            <Text>Number of upvotes on Reddit</Text>
          </Flex>
        }
      >
        <Flex align="center" cursor="default">
          <Box href="https://www.reddit.com">
            <Image
              borderRadius="full"
              src="https://cdn3.iconfinder.com/data/icons/2018-social-media-logotypes/1000/2018_social_media_popular_app_logo_reddit-512.png"
              alt="Reddit"
              w="20px"
              h="20px"
              mr={2}
            />
          </Box>
          <Text fontSize="sm">{paper.redditScore || 0}</Text>
        </Flex>
      </Tooltip>
    </Flex>
  );
};

export default SocialScore;
