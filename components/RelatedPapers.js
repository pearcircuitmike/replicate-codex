// components/RelatedPapers.js
import React from "react";
import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import PaperCard from "./PaperCard";

const RelatedPapers = ({ relatedPapers }) => {
  if (!relatedPapers || relatedPapers.length === 0) {
    return null;
  }

  return (
    <Box mt={8}>
      <Heading as="h2" size="lg" mb={4}>
        Related Papers
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        {relatedPapers.map((relatedPaper) => (
          <PaperCard key={relatedPaper.id} paper={relatedPaper} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default RelatedPapers;
