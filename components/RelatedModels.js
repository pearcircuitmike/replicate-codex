// components/RelatedModels.js
import React from "react";
import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import ModelCard from "./Cards/ModelCard";

const RelatedModels = ({ relatedModels }) => {
  if (!relatedModels || relatedModels.length === 0) {
    return null;
  }

  return (
    <Box mt={8}>
      <Heading as="h2" size="lg" mb={4}>
        Related Models
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        {relatedModels.map((relatedModel) => (
          <ModelCard key={relatedModel.id} model={relatedModel} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default RelatedModels;
