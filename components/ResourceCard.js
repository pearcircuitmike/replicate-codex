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
  blurb = "No description provided",
  owners = [],
  isCollection = false, // New argument
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
          height="350px"
          mb={4}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          transition="transform 0.2s ease, box-shadow 0.2s ease"
          _hover={{ boxShadow: "lg", transform: "translateY(-5px)" }}
          bg={isCollection ? "blue.500" : "white"} // Change background color if it's a collection
          color={isCollection ? "white" : "black"} // Change font color if it's a collection
        >
          <VStack align="start" spacing={3}>
            {/* Title with Collection Icon */}
            <HStack>
              <Text
                as="h2"
                fontSize="lg"
                fontWeight="bold"
                noOfLines={2}
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {isCollection && `📂${" "}`}
                {title}
              </Text>
            </HStack>

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

            {/* Blurb */}
            <Text
              fontSize="sm"
              color={isCollection ? "white" : "gray.600"}
              noOfLines={3}
            >
              {blurb}
            </Text>
          </VStack>

          {/* Score and Owners */}
          <HStack
            mt={2}
            position="relative"
            alignSelf="start"
            justify="space-between"
            width="100%"
          >
            {/* Score */}
            {score !== undefined && (
              <HStack>
                <Text fontSize="lg" role="img" aria-label={scoreLabel}>
                  🔥
                </Text>{" "}
                {/* Fire emoji */}
                <Text fontSize="sm" fontWeight="bold">
                  {score}
                </Text>
              </HStack>
            )}

            {/* Owners as plain text */}
            {owners.length > 0 && (
              <HStack
                spacing={2}
                justify="flex-end"
                flex="1"
                textAlign="right"
                isTruncated
              >
                <Text
                  fontSize="sm"
                  color={isCollection ? "white" : "gray.500"} // Adjust color based on collection status
                  isTruncated
                  noOfLines={1}
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {owners.map((owner) => owner.name).join(", ")}
                </Text>
              </HStack>
            )}
          </HStack>
        </Box>
      </Link>
    </NextLink>
  );
};

export default ResourceCard;
