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

const PaperCard = ({ paper }) => {
  const thumbnailUrl = paper.thumbnail;

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
            <Center h="100%" bg="blue.100">
              <Heading size="xl" color="blue.500">
                {paper.title.charAt(0).toUpperCase()}
              </Heading>
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
