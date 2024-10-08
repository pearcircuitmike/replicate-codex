// components/LandingPageTrending.js

import React from "react";
import { Box, Heading, HStack } from "@chakra-ui/react";
import ResourceCard from "@/components/ResourceCard";
import { formatLargeNumber } from "@/pages/api/utils/formatLargeNumber";

const LandingPageTrending = ({ trendingModels, trendingPapers, isLoading }) => {
  const renderSection = (title, items, renderItem) => (
    <Box mb={8}>
      <Heading as="h2" size="md" mb={4}>
        {title}
      </Heading>
      <HStack
        spacing={4}
        overflowX="auto"
        pb={2}
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        }}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <React.Fragment key={index}>
                <ResourceCard isLoading />
              </React.Fragment>
            ))
          : items.map(renderItem)}
      </HStack>
    </Box>
  );

  const renderPaper = (paper) => (
    <ResourceCard
      key={paper.id}
      href={`/papers/${encodeURIComponent(paper.platform)}/${encodeURIComponent(
        paper.slug
      )}`}
      title={paper.title}
      score={Math.floor(paper.totalScore)}
      scoreLabel="Total Score"
      imageSrc={paper.thumbnail}
      placeholderTitle="Paper"
    />
  );

  const renderModel = (model) => (
    <ResourceCard
      key={model.id}
      href={`/models/${model.platform}/${encodeURIComponent(model.slug)}`}
      title={model.modelName}
      subtitle={`Creator: ${model.creator}`}
      score={formatLargeNumber(Math.floor(model.totalScore))}
      scoreLabel="Total Score"
      imageSrc={model.example}
      placeholderTitle="Model"
    />
  );

  return (
    <Box px={"5vw"} color="gray.700">
      {renderSection("Breakout papers", trendingPapers, renderPaper)}
      {renderSection("Trending models", trendingModels, renderModel)}
    </Box>
  );
};

export default LandingPageTrending;
