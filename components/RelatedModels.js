// components/RelatedModels.js
import React, { useState, useEffect } from "react";
import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import ModelCard from "./Cards/ModelCard";

export default function RelatedModels({ slug, platform }) {
  const [embedding, setEmbedding] = useState(null);
  const [relatedModels, setRelatedModels] = useState([]);

  // 1) fetch embedding
  useEffect(() => {
    if (!slug || !platform) return;

    (async () => {
      try {
        const res = await fetch("/api/utils/fetch-model-embedding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, platform }),
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Embedding request failed: ${res.status} - ${errorText}`
          );
        }
        const data = await res.json();
        setEmbedding(data.embedding);
      } catch (err) {
        console.error("Error fetching embedding:", err);
      }
    })();
  }, [slug, platform]);

  // 2) fetch related once we have embedding
  useEffect(() => {
    if (!embedding) return;

    (async () => {
      try {
        const res = await fetch("/api/utils/fetchRelatedModels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ embedding }),
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Related models request failed: ${res.status} - ${errorText}`
          );
        }
        const { relatedModels: rm } = await res.json();
        setRelatedModels(rm || []);
      } catch (err) {
        console.error("Error fetching related models:", err);
      }
    })();
  }, [embedding]);

  // No data yet, return null or a small “loading” UI
  if (!relatedModels || relatedModels.length === 0) {
    return null;
  }

  const displayModels = relatedModels.slice(1, 5);

  return (
    <Box mt={8}>
      <Heading as="h2" size="lg" mb={4}>
        Related Models
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        {displayModels.map((mdl) => (
          <ModelCard key={mdl.id} model={mdl} />
        ))}
      </SimpleGrid>
    </Box>
  );
}
