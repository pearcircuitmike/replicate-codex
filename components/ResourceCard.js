// components/ResourceCard.js

import React from "react";
import {
  Box,
  Text,
  Image,
  HStack,
  Link,
  VStack,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import NextLink from "next/link";
import EmojiWithGradient from "@/components/EmojiWithGradient";

const ResourceCard = ({
  href,
  title,
  score,
  scoreLabel = "Score",
  imageSrc,
  placeholderTitle,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Box
        p={4}
        borderWidth={1}
        borderRadius="md"
        width="350px"
        height="300px"
        mb={4}
      >
        <VStack align="start" spacing={3}>
          <Skeleton height="20px" width="80%" />
          <Skeleton height="150px" width="100%" />
          <SkeletonText mt={4} noOfLines={1} width="40%" />
        </VStack>
      </Box>
    );
  }

  return (
    <NextLink href={href} passHref>
      <Link _hover={{ textDecoration: "none" }}>
        <Box
          borderWidth={1}
          borderRadius="md"
          p={4}
          width="350px"
          height="300px"
          mb={4}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          transition="transform 0.2s ease, box-shadow 0.2s ease"
          _hover={{ boxShadow: "lg", transform: "translateY(-5px)" }}
        >
          <VStack align="start" spacing={3}>
            {/* Title */}
            <Text
              as="h2"
              fontSize="lg"
              fontWeight="bold"
              noOfLines={2}
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {title}
            </Text>

            {/* Image */}
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={title || placeholderTitle}
                height="150px"
                width="100%"
                objectFit="cover"
                borderRadius="md"
              />
            ) : (
              <EmojiWithGradient
                title={title || placeholderTitle}
                height="150px"
                width="100%"
                objectFit="cover"
              />
            )}
          </VStack>

          {/* Score */}
          {score !== undefined && (
            <HStack mt={2} position="relative" alignSelf="start">
              <Image
                src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/fire.png"
                alt={scoreLabel}
                boxSize="20px"
                mr={1}
              />
              <Text fontSize="lg" fontWeight="bold">
                {score}
              </Text>
            </HStack>
          )}
        </Box>
      </Link>
    </NextLink>
  );
};

export default ResourceCard;
