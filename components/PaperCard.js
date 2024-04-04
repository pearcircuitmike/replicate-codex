import React from "react";
import {
  Box,
  Heading,
  Text,
  Link as ChakraLink,
  Image,
  Tag,
  Flex,
  Center,
} from "@chakra-ui/react";
import Link from "next/link";
import emojiMap from "../data/emojiMap.json";

const getColorByTitle = (title, index) => {
  const colors = [
    "red.500",
    "orange.500",
    "yellow.500",
    "green.500",
    "teal.500",
    "blue.500",
    "cyan.500",
    "purple.500",
    "pink.500",
  ];
  const hash = title
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = (hash + index) % colors.length;
  return colors[colorIndex];
};

const getHashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return hash;
};

const getRandomEmoji = (title) => {
  const emojis = Object.values(emojiMap);
  const hash = getHashCode(title);
  const randomIndex = Math.abs(hash) % emojis.length;
  return emojis[randomIndex];
};

const getEmojiForPaper = (title) => {
  const keywords = title.toLowerCase().split(" ");
  for (const keyword of keywords) {
    if (emojiMap[keyword]) {
      return emojiMap[keyword];
    }
  }
  return getRandomEmoji(title);
};

const PaperCard = ({ paper }) => {
  const thumbnailUrl = paper.thumbnail;
  const bgColor1 = getColorByTitle(paper.title, 0);
  const bgColor2 = getColorByTitle(paper.title, 1);
  const gradientBg = `linear(to-r, ${bgColor1}, ${bgColor2})`;

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
      <Link href={`/papers/${paper.id}`} legacyBehavior>
        <Box h="250px" overflow="hidden" position="relative">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={paper.title}
              objectFit="cover"
              w="100%"
              h="100%"
            />
          ) : (
            <Center h="100%" bgGradient={gradientBg}>
              <Text fontSize="6xl">{getEmojiForPaper(paper.title)}</Text>
            </Center>
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
          {paper.title}
        </Heading>
        <Text fontSize="sm" color="gray.500" noOfLines={2} mb={4}>
          {paper.authors.join(", ")}
        </Text>
        <Text fontSize="sm" noOfLines={4}>
          {paper.abstract || "No abstract available."}
        </Text>
        <Text>
          <Link href={`/papers/${paper.id}`} passHref legacyBehavior>
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
      <Flex
        justify="space-between"
        mt="auto"
        mb="10px"
        spacing={5}
        pl="15px"
        pr="15px"
      >
        <Text fontSize="sm">
          {new Date(paper.publishedDate).toLocaleDateString()}
        </Text>
      </Flex>
      <Flex wrap="wrap" mb="10px" pl="15px" pr="15px">
        {paper.arxivCategories &&
          paper.arxivCategories.map((category, index) => (
            <Tag key={index} size="sm" colorScheme="blue" mr="5px" mb="5px">
              {category}
            </Tag>
          ))}
      </Flex>
    </Box>
  );
};

export default PaperCard;
