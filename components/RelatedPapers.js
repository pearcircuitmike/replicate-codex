// components/RelatedPapers.js

import React, { useState, useEffect } from "react";
import { Box, Heading, Text, Link, Skeleton, VStack } from "@chakra-ui/react";
import NextLink from "next/link";

const RelatedPapers = ({ slug, platform }) => {
  const [embedding, setEmbedding] = useState(null);
  const [relatedPapers, setRelatedPapers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch embedding for this paper
  useEffect(() => {
    if (!slug || !platform) return;

    const fetchEmbedding = async () => {
      setLoading(true);
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
      } catch (err) {
        console.error("Error fetching embedding:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmbedding();
  }, [slug, platform]);

  // 2. Once we have the embedding, fetch related papers
  useEffect(() => {
    const fetchRelated = async () => {
      if (!embedding || embedding.length === 0) return;
      setLoading(true);

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
      } catch (err) {
        console.error("Error fetching related papers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [embedding]);

  // Show loader if still fetching and have no results yet
  if (loading && relatedPapers.length === 0) {
    return (
      <Box mt={2} p={0}>
        <Heading as="h2" size="sm" mb={2}>
          Related Papers
        </Heading>
        <Skeleton height="60px" mb={2} />
        <Skeleton height="60px" mb={2} />
      </Box>
    );
  }

  // If no related papers, show nothing
  if (!relatedPapers || relatedPapers.length === 0) {
    return null;
  }

  // Optionally skip the first paper if it's the current paper
  const displayPapers = relatedPapers.slice(1, 5);

  return (
    <Box mt={2} p={0}>
      <Heading as="h2" size="sm" mb={2}>
        Related Papers
      </Heading>
      <VStack spacing={3} align="stretch">
        {displayPapers.map((paper) => (
          <Box
            key={paper.id}
            p={2}
            borderWidth="1px"
            borderRadius="md"
            bg="white"
            boxShadow="sm"
          >
            <Heading as="h3" size="xs" mb={1}>
              <Link
                as={NextLink}
                href={`/papers/${paper.platform}/${paper.slug}`}
                color="blue.600"
                _hover={{ textDecoration: "underline" }}
              >
                {paper.title}
              </Link>
            </Heading>
            <Text fontSize="xs" color="gray.700" noOfLines={2}>
              {paper.abstract}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default RelatedPapers;
