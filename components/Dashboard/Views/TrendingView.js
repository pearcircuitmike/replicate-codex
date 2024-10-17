// components/Dashboard/Views/TrendingView.js

import React from "react";
import { Box, Heading, Text, HStack, useMediaQuery } from "@chakra-ui/react";
import ResourceCard from "@/components/ResourceCard";
import { formatLargeNumber } from "@/pages/api/utils/formatLargeNumber";

// Helper to clean and truncate summaries
const cleanAndTruncateSummary = (summary, type) => {
  if (!summary) return "No description provided";

  if (type === "model") {
    summary = summary.replace("## Model overview", "").trim();
    summary = summary.replace("## Model Overview", "").trim();
  } else if (type === "paper") {
    summary = summary.replace("## Overview", "").replace(/-/g, "").trim();
    summary = summary.replace("## Overview - ", "").replace(/-/g, "").trim();
  }

  const maxLines = 3;
  const lines = summary.split("\n").filter(Boolean);

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines).join(" ") + "...";
  }

  return lines.join(" ");
};

const TrendingView = ({ trendingData = {}, hasError = false }) => {
  const [isLargerThan480] = useMediaQuery("(min-width: 480px)");

  // Use default empty arrays to prevent errors
  const {
    papers = [],
    topViewedPapers = [],
    trendingTopics = [],
    authors = [],
    models = [],
    creators = [],
    topSearchQueries = [],
  } = trendingData;

  // Helper function to render each section
  const renderSection = (title, description, items, renderItem) => (
    <Box mb={8} key={title}>
      <Heading as="h2" size="md">
        {title}
      </Heading>
      <Text color="gray.500" mb={4} fontSize="sm">
        {description}
      </Text>
      <HStack
        spacing={4}
        overflowX="auto"
        py={2}
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        }}
      >
        {items.length > 0 ? (
          items.map(renderItem)
        ) : (
          <Text>No data available.</Text>
        )}
      </HStack>
    </Box>
  );

  // Define sections with the updated order
  const sections = [
    {
      title: "Top scoring papers",
      description: "Papers with the biggest impact on the community",
      data: papers,
      renderItem: (paper) => {
        const blurb = cleanAndTruncateSummary(paper.generatedSummary, "paper");
        return (
          <ResourceCard
            key={paper.id}
            href={`/papers/${encodeURIComponent(
              paper.platform
            )}/${encodeURIComponent(paper.slug)}`}
            title={paper.title}
            score={Math.floor(paper.totalScore)}
            scoreLabel="Total Score"
            imageSrc={paper.thumbnail}
            blurb={blurb}
            placeholderTitle="Paper"
            isLoading={false}
          />
        );
      },
    },
    {
      title: "Most read papers",
      description: "Papers with the most reads in the last day",
      data: topViewedPapers,
      renderItem: (paper) => {
        const blurb = cleanAndTruncateSummary(paper.generatedSummary, "paper");
        return (
          <ResourceCard
            key={paper.id}
            href={`/papers/arxiv/${paper.slug}`}
            title={paper.title}
            subtitle={`${paper.view_count} views`}
            score={paper.view_count}
            blurb={blurb}
            imageSrc={paper.thumbnail}
            scoreLabel="Views"
            placeholderTitle="Paper"
            isLoading={false}
          />
        );
      },
    },
    {
      title: "Popular collections",
      description:
        "Explore collections of the top research topics on the site today",
      data: trendingTopics,
      renderItem: (topic) => (
        <ResourceCard
          key={topic.id}
          href={`/dashboard/explore/${topic.id}`}
          title={topic.topic_name}
          blurb={
            `Explore papers related to the following topics: ` +
            topic.keywords.slice(0, 3).join(", ")
          }
          placeholderTitle="Topic"
          isCollection={true}
          isLoading={false}
        />
      ),
    },
    {
      title: "Top authors",
      description: "Authors with the most impactful research",
      data: authors,
      renderItem: (author) => (
        <ResourceCard
          key={author.id || author.uuid || author.author}
          href={`/authors/arxiv/${encodeURIComponent(author.author)}`}
          title={author.author}
          subtitle="Platform: arxiv"
          score={formatLargeNumber(author.totalAuthorScore)}
          scoreLabel="Author Score"
          blurb="Click to see papers by this author"
          placeholderTitle="Author"
          isLoading={false}
        />
      ),
    },
    {
      title: "Top models",
      description: "The highest scoring AI models",
      data: models,
      renderItem: (model) => {
        const creator = [
          {
            name: model.creator,
            link: `/creators/${encodeURIComponent(
              model.platform
            )}/${encodeURIComponent(model.creator)}`,
          },
        ];
        const blurb = cleanAndTruncateSummary(model.generatedSummary, "model");

        return (
          <ResourceCard
            key={model.id}
            href={`/models/${model.platform}/${encodeURIComponent(model.slug)}`}
            title={model.modelName}
            score={formatLargeNumber(Math.floor(model.totalScore))}
            scoreLabel="Total Score"
            imageSrc={model.example}
            blurb={
              model.generatedSummary
                ? blurb
                : "No description available for this model. Click to learn more!"
            }
            owners={creator}
            placeholderTitle="Model"
            isLoading={false}
          />
        );
      },
    },
    {
      title: "Top maintainers",
      description: "The people behind the top models in the community",
      data: creators,
      renderItem: (creator) => (
        <ResourceCard
          key={creator.id || creator.uuid || creator.creator}
          href={`/creators/${encodeURIComponent(
            creator.platform
          )}/${encodeURIComponent(creator.creator)}`}
          title={creator.creator}
          blurb={`Click to learn more about ${creator.creator}`}
          subtitle={`Platform: ${creator.platform}`}
          score={formatLargeNumber(Math.floor(creator.totalCreatorScore))}
          scoreLabel="Creator Score"
          placeholderTitle="Creator"
          isLoading={false}
        />
      ),
    },
    {
      title: "Top searches",
      description: "See what the community is searching for.",
      data: topSearchQueries,
      renderItem: (query) => (
        <ResourceCard
          key={query.id || query.uuid || query.search_query}
          href={`/dashboard/discover?q=${encodeURIComponent(
            query.search_query
          )}`}
          title={query.search_query}
          subtitle={`Type: ${query.resource_type}`}
          score={query.search_count}
          scoreLabel="Searches"
          blurb="Click to view this search"
          placeholderTitle="Search Query"
          isCollection={true}
          isLoading={false}
        />
      ),
    },
  ];

  return (
    <Box px={"2vw"} color="gray.700" py={isLargerThan480 ? 4 : 2}>
      <Heading as="h1" size="xl" mb={8}>
        Trending
      </Heading>

      {hasError && (
        <Text color="red.500" mb={4}>
          Failed to load trending data. Please try again later.
        </Text>
      )}

      {sections.map((section) =>
        renderSection(
          section.title,
          section.description,
          section.data,
          section.renderItem
        )
      )}
    </Box>
  );
};

export default TrendingView;
