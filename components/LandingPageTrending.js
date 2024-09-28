// components/LandingPageTrending.js

import React from "react";
import { Box, Heading, VStack, SimpleGrid } from "@chakra-ui/react";
import ResourceCard from "@/components/ResourceCard";
import { formatLargeNumber } from "@/pages/api/utils/formatLargeNumber";

const LandingPageTrending = ({
  trendingModels,
  trendingPapers,
  trendingCreators,
  trendingAuthors,
  isLoading,
}) => {
  const renderSection = (title, items, renderItem) => (
    <Box>
      <Heading as="h2" size="md" mb={4}>
        {title}
      </Heading>
      <VStack spacing={4} align="stretch">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <React.Fragment key={index}>
                <ResourceCard isLoading />
              </React.Fragment>
            ))
          : items.map(renderItem)}
      </VStack>
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

  const renderAuthor = (authorData) => (
    <ResourceCard
      key={authorData.author}
      href={`/authors/${encodeURIComponent("arxiv")}/${encodeURIComponent(
        authorData.author
      )}`}
      title={authorData.author}
      subtitle="Platform: arxiv"
      score={formatLargeNumber(authorData.totalAuthorScore)}
      scoreLabel="Author Score"
      placeholderTitle="Author"
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

  const renderCreator = (creator) => (
    <ResourceCard
      key={creator.id}
      href={`/creators/${encodeURIComponent(
        creator.platform
      )}/${encodeURIComponent(creator.creator)}`}
      title={creator.creator}
      subtitle={`Platform: ${creator.platform}`}
      score={formatLargeNumber(Math.floor(creator.totalCreatorScore))}
      scoreLabel="Creator Score"
      placeholderTitle="Creator"
    />
  );

  return (
    <Box px={"5vw"} color="gray.700">
      <SimpleGrid columns={[1, 2, 2, 4]} spacing={8}>
        {renderSection("Breakout papers", trendingPapers, renderPaper)}
        {renderSection("Star researchers", trendingAuthors, renderAuthor)}
        {renderSection("Trending models", trendingModels, renderModel)}
        {renderSection("Top builders", trendingCreators, renderCreator)}
      </SimpleGrid>
    </Box>
  );
};

export default LandingPageTrending;
