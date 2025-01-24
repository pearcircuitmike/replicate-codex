// /components/Community/CommunityNotesTab.jsx

import React from "react";
import {
  Box,
  Flex,
  Avatar,
  Text,
  Heading,
  Link as ChakraLink,
} from "@chakra-ui/react";
import NextLink from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const CommunityNotesTab = ({ notes = [] }) => {
  if (notes.length === 0) {
    return <Text>No notes yet. Start a discussion!</Text>;
  }

  return (
    <Box>
      {notes.map((note) => (
        <Box
          key={note.id}
          mb={4}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          bg="white"
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" mb={2}>
            <Flex align="center">
              <Avatar
                size="sm"
                src={note.userProfile?.avatar_url || ""}
                name={note.userProfile?.full_name || "User"}
                mr={2}
              />
              <Heading as="h4" size="sm" isTruncated>
                {note.userProfile?.full_name || "Anonymous"}
              </Heading>
            </Flex>

            <Text fontSize="sm" color="gray.500">
              {dayjs(note.created_at).fromNow()}
            </Text>
          </Flex>

          <Text fontSize="sm" mb={3}>
            {note.note_text}
          </Text>

          {note.arxivPapersData && (
            <Flex align="center">
              <Text fontSize="sm" color="blue.600" mr={2}>
                📄
              </Text>
              <NextLink
                href={`/papers/${note.arxivPapersData.platform}/${note.arxivPapersData.slug}`}
                passHref
              >
                <ChakraLink color="blue.600" fontSize="sm">
                  {note.arxivPapersData.title}
                </ChakraLink>
              </NextLink>
            </Flex>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default CommunityNotesTab;
