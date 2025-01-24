// /components/Community/CommunityFollowersTab.jsx
import React from "react";
import { SimpleGrid, Box, Avatar, HStack, Text } from "@chakra-ui/react";

const CommunityFollowersTab = ({ followers }) => {
  if (!followers || followers.length === 0) {
    return <Text>No followers yet. Be the first to join!</Text>;
  }

  return (
    <SimpleGrid columns={[1, 2, 3]} spacing={6}>
      {followers.map((f) => (
        <Box key={f.id} p={4} borderWidth="1px" borderRadius="md">
          <HStack spacing={4}>
            <Avatar src={f.profiles?.avatar_url} size="sm" />
            <Text>{f.profiles?.full_name || "Anonymous"}</Text>
          </HStack>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default CommunityFollowersTab;
