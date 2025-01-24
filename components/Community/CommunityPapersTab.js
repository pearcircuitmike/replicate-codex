// /components/Community/CommunityPapersTab.jsx
import React from "react";
import { SimpleGrid, Box, Heading, Text } from "@chakra-ui/react";

const CommunityPapersTab = ({ papers }) => {
  if (!papers || papers.length === 0) {
    return <Text>No papers found for this community.</Text>;
  }

  return (
    <SimpleGrid columns={[1, 2, 3]} spacing={6}>
      {papers.map((paper) => (
        <Box key={paper.id} p={4} borderWidth="1px" borderRadius="md">
          <Heading as="h3" size="sm" mb={2}>
            {paper.title}
          </Heading>
          <Text fontSize="sm" color="gray.600" noOfLines={4}>
            {paper.generatedSummary || "No summary available."}
          </Text>
          <Text mt={2} fontSize="xs" color="gray.500">
            By: {paper.authors?.join(", ") || "Unknown"}
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default CommunityPapersTab;
