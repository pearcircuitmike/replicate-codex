// ToolCard.js
import React from "react";
import {
  Box,
  Heading,
  Text,
  Link as ChakraLink,
  Image,
  Tag,
  Flex,
} from "@chakra-ui/react";
import Link from "next/link";
import EmojiWithGradient from "./EmojiWithGradient";

const ToolCard = ({ tool }) => {
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
      <Link href={`/tools/${encodeURIComponent(tool.slug)}`} legacyBehavior>
        <Box h="250px" overflow="hidden" position="relative">
          {tool.image ? (
            <Image
              src={tool.image}
              alt={tool.toolName}
              objectFit="cover"
              w="100%"
              h="100%"
            />
          ) : (
            <EmojiWithGradient title={tool.toolName} />
          )}
        </Box>
      </Link>
      <Box p="15px">
        <Heading as="h3" size="md" noOfLines={2} mb={2}>
          {isNew(tool.indexedDate) && (
            <Tag size="md" colorScheme="green" mr="5px">
              New!
            </Tag>
          )}
          {tool.isFeatured && (
            <Image
              src="https://emojiisland.com/cdn/shop/products/Star_Emoji_large.png?v=1571606063"
              alt="Featured"
              boxSize="20px"
              mr="5px"
              display="inline-block"
              verticalAlign="middle"
            />
          )}
          {tool.toolName}
        </Heading>
        <Text fontSize="sm" color="gray.500" noOfLines={2} mb={4}>
          Added on {new Date(tool.indexedDate).toLocaleDateString()}
        </Text>
        <Text fontSize="sm" noOfLines={4}>
          {tool.description || "No description available."}
        </Text>
        <Text>
          <Link href={`/tools/${encodeURIComponent(tool.slug)}`} passHref>
            <ChakraLink
              fontSize="sm"
              color="blue.500"
              textDecoration="underline"
            >
              Learn more
            </ChakraLink>
          </Link>
        </Text>
      </Box>
      <Flex wrap="wrap" mb="10px" pl="15px" pr="15px">
        {tool.categories &&
          tool.categories.map((category, index) => (
            <Link
              key={index}
              href={{
                pathname: "/tools",
                query: { selectedCategory: category },
              }}
              passHref
            >
              <Tag
                size="sm"
                colorScheme="blue"
                mr="5px"
                mb="5px"
                cursor="pointer"
              >
                {category}
              </Tag>
            </Link>
          ))}
      </Flex>
    </Box>
  );
};

export default ToolCard;
