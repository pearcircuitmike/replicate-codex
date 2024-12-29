// components/RelatedPapers.js

import React, { useState, useEffect } from "react";
import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import PaperCard from "./Cards/PaperCard";

const RelatedPapers = ({ slug, platform }) => {
  const [embedding, setEmbedding] = useState(null);
  const [relatedPapers, setRelatedPapers] = useState([]);

  // 1. Fetch the embedding for this paper
  useEffect(() => {
    if (!slug || !platform) return;

    const fetchEmbedding = async () => {
      try {
        const res = await fetch("/api/utils/fetch-paper-embedding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, platform }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Embedding request failed with status ${res.status}: ${errorText}`
          );
        }

        const data = await res.json();
        setEmbedding(data.embedding);
      } catch (error) {
        console.error("Error fetching embedding:", error);
      }
    };

    fetchEmbedding();
  }, [slug, platform]);

  // 2. Once we have the embedding, fetch related papers
  useEffect(() => {
    if (!embedding || embedding.length === 0) return;

    const fetchRelated = async () => {
      try {
        const res = await fetch("/api/utils/fetchRelatedPapers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ embedding }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Related papers request failed with status ${res.status}: ${errorText}`
          );
        }

        const data = await res.json();
        setRelatedPapers(data.papers || []);
      } catch (error) {
        console.error("Error fetching related papers:", error);
      }
    };

    fetchRelated();
  }, [embedding]);

  // If no related papers, exit early
  if (!relatedPapers || relatedPapers.length === 0) {
    return null;
  }

  // Optionally skip the first paper if it's the current paper
  // For demonstration, we skip the first item
  const displayPapers = relatedPapers.slice(1, 5);

  return (
    <Box mt={8}>
      <Heading as="h2" size="lg" mb={4}>
        Related Papers
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={4}>
        {displayPapers.map((relatedPaper) => (
          <PaperCard key={relatedPaper.id} paper={relatedPaper} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default RelatedPapers;
