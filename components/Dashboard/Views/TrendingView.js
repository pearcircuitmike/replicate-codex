import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  HStack,
  useMediaQuery,
  Spinner,
} from "@chakra-ui/react";
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

const TrendingView = () => {
  const [isLargerThan480] = useMediaQuery("(min-width: 480px)");
  const [trendingData, setTrendingData] = useState({
    trendingTopics: [],
    topViewedPapers: [],
    topSearchQueries: [],
    papers: [],
    models: [],
    creators: [],
    authors: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const startDate = new Date();
      startDate.setUTCHours(0, 0, 0, 0);

      try {
        const [
          trendingTopics,
          topViewedPapers,
          topSearchQueries,
          papers,
          models,
          creators,
          authors,
        ] = await Promise.all([
          fetch(`/api/dashboard/trending-topics?limit=12`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch trending topics");
            return res.json();
          }),
          fetch(`/api/dashboard/top-viewed-papers?limit=12`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch top viewed papers");
            return res.json();
          }),
          fetch(`/api/dashboard/top-search-queries?limit=12`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch top search queries");
            return res.json();
          }),
          fetch(
            `/api/trending/papers?platform=arxiv&startDate=${encodeURIComponent(
              startDate.toISOString()
            )}&limit=12`
          ).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch trending papers");
            return res.json();
          }),
          fetch(
            `/api/trending/models?startDate=${encodeURIComponent(
              startDate.toISOString()
            )}&limit=12`
          ).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch trending models");
            return res.json();
          }),
          fetch(`/api/trending/creators?limit=12`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch trending creators");
            return res.json();
          }),
          fetch(`/api/trending/authors?limit=12`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch trending authors");
            return res.json();
          }),
        ]);

        setTrendingData({
          trendingTopics,
          topViewedPapers,
          topSearchQueries,
          papers,
          models,
          creators,
          authors,
        });
      } catch (error) {
        console.error("Error fetching trending data:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Helper function to render each section
  const renderSection = (title, description, items, renderItem) => (
    <Box mb={8}>
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
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <ResourceCard key={index} isLoading />
          ))
        ) : items.length > 0 ? (
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
      data: trendingData.papers,
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
            isLoading={isLoading}
          />
        );
      },
    },
    {
      title: "Most read papers",
      description: "Papers with the most reads in the last day",
      data: trendingData.topViewedPapers,
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
            isLoading={isLoading}
          />
        );
      },
    },
    {
      title: "Popular collections",
      description:
        "Explore collections of the top research topics on the site today",
      data: trendingData.trendingTopics,
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
          isLoading={isLoading}
        />
      ),
    },
    {
      title: "Top authors",
      description: "Authors with the most impactful research",
      data: trendingData.authors,
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
          isLoading={isLoading}
        />
      ),
    },
    {
      title: "Top models",
      description: "The highest scoring AI models",
      data: trendingData.models,
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
            isLoading={isLoading}
          />
        );
      },
    },
    {
      title: "Top maintainers",
      description: "The people behind the top models in the community",
      data: trendingData.creators,
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
          isLoading={isLoading}
        />
      ),
    },
    {
      title: "Top searches",
      description: "See what the community is searching for.",
      data: trendingData.topSearchQueries,
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
          isLoading={isLoading}
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

      {isLoading && trendingData.trendingTopics.length === 0 ? (
        <Spinner size="xl" alignSelf="center" />
      ) : (
        sections.map((section, index) =>
          renderSection(
            section.title,
            section.description,
            section.data,
            section.renderItem
          )
        )
      )}
    </Box>
  );
};

export default TrendingView;
