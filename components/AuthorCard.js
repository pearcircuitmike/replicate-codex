// components/AuthorCard.js
import React from "react";
import { Box, Heading, Text, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";

const getInitials = (name) => {
  const names = name.split(" ");
  const initials = names
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("");
  return initials.toUpperCase();
};

const getColorByAuthor = (author) => {
  const colors = [
    "red.500",
    "orange.500",
    "yellow.500",
    "green.500",
    "teal.500",
    "blue.500",
    "cyan.500",
    "purple.500",
    "gray.500",
  ];
  const hash = author
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % colors.length;
  return colors[index];
};

const getMedalEmoji = (rank) => {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return "";
  }
};

const AuthorCard = ({ author, platform }) => {
  if (!author) {
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
        <Text>No author data available.</Text>
      </Box>
    );
  } else {
    const bgColor = getColorByAuthor(author.author);
    const medalEmoji = getMedalEmoji(author.authorRank);

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
          <Flex
            borderRadius="full"
            width="100px"
            height="100px"
            backgroundColor={bgColor}
            color="white"
            fontSize="3xl"
            fontWeight="bold"
            mb={3}
            alignItems="center"
            justifyContent="center"
            mx="auto"
          >
            {getInitials(author.author)}
          </Flex>
          <Heading as="h2" size="md" isTruncated mb={2}>
            {author.author}
          </Heading>
          <Text>Total Score: {author.totalAuthorScore}</Text>
          <Text>
            Author Rank: {author.authorRank} {medalEmoji}
          </Text>
        </Box>
        <Flex justifyContent="center" mt={3}>
          <Link
            href={`/authors/${platform}/${encodeURIComponent(author.author)}`}
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

export default AuthorCard;
