// components/AuthorCard.js
import React from "react";
import { Box, Heading, Text, Avatar, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";

const AuthorCard = ({ author }) => {
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
          <Avatar src={`https://github.com/${author}.png`} size="2xl" mb={3} />
          <Heading as="h2" size="md" isTruncated mb={2}>
            {author}
          </Heading>
        </Box>
        <Flex justifyContent="center" mt={3}>
          <Link href={`/authors/${author}`} passHref legacyBehavior>
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
