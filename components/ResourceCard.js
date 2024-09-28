// components/ResourceCard.js

import React from "react";
import {
  Box,
  Text,
  HStack,
  VStack,
  Image,
  Center,
  Link,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import NextLink from "next/link";
import EmojiWithGradient from "@/components/EmojiWithGradient";

const ResourceCard = ({
  href,
  title,
  subtitle,
  description,
  score,
  scoreLabel = "Score",
  imageSrc,
  placeholderTitle,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Box p={4} borderWidth={1} borderRadius="md">
        <HStack align="center">
          <VStack align="start" spacing={1} flex={1}>
            <Skeleton height="20px" width="80%" />
            <SkeletonText mt={2} noOfLines={2} spacing={2} />
          </VStack>
          <SkeletonCircle size="80px" />
        </HStack>
      </Box>
    );
  }

  return (
    <NextLink href={href} passHref>
      <Link _hover={{ textDecoration: "none" }}>
        <Box
          p={4}
          borderWidth={1}
          borderRadius="md"
          _hover={{ boxShadow: "md" }}
        >
          <HStack align="center">
            <VStack align="start" spacing={1} flex={1}>
              <Text
                fontWeight="bold"
                noOfLines={2}
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {title}
              </Text>
              {subtitle && (
                <Text fontSize="sm" color="gray.600">
                  {subtitle}
                </Text>
              )}
              {description && (
                <Text fontSize="sm" color="gray.500" noOfLines={2}>
                  {description}
                </Text>
              )}
              {score !== undefined && (
                <HStack mt={2}>
                  <Image
                    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/fire.png"
                    alt={scoreLabel}
                    boxSize="20px"
                    mr={1}
                  />
                  <Text>{score}</Text>
                </HStack>
              )}
            </VStack>
            <Center height="100%">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={title || placeholderTitle}
                  height="80px"
                  width="80px"
                  objectFit="cover"
                  borderRadius="md"
                />
              ) : (
                <EmojiWithGradient
                  title={title || placeholderTitle}
                  height="80px"
                  width="80px"
                  objectFit="cover"
                />
              )}
            </Center>
          </HStack>
        </Box>
      </Link>
    </NextLink>
  );
};

export default ResourceCard;
