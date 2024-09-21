// Feed.jsx

import React from "react";
import { Box, SimpleGrid, Text } from "@chakra-ui/react";
import ModelCard from "../ModelCard";
import PaperCard from "../PaperCard";

const Feed = ({ resourceType, results }) => {
  if (!results) {
    // If results prop is undefined or null
    return null;
  }

  if (results.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text>No {resourceType === "paper" ? "papers" : "models"} found.</Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={[1, 2, 3]} spacing={6}>
      {results.map((item) =>
        resourceType === "paper" ? (
          <PaperCard key={item.id} paper={item} />
        ) : (
          <ModelCard key={item.id} model={item} />
        )
      )}
    </SimpleGrid>
  );
};

export default Feed;
