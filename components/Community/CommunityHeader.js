// /components/Community/CommunityHeader.jsx

import React from "react";
import { Heading, Text, Box } from "@chakra-ui/react";

const CommunityHeader = ({ community }) => {
  return (
    <Box mb={6}>
      <Heading as="h1" size="lg" mb={2}>
        {community.name}
      </Heading>
      <Text fontSize="md" color="gray.600" mb={2}>
        {community.description || "No description provided."}
      </Text>

      {/* Show tasks */}
      <Text fontSize="sm" color="gray.600">
        {community.tasks ? `Tasks: ${community.tasks}` : "No tasks specified."}
      </Text>
    </Box>
  );
};

export default CommunityHeader;
