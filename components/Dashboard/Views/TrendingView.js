// components/Dashboard/Views/TrendingView.js

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
      // Use the current date, set to midnight UTC
      const startDate = new Date();
      startDate.setUTCHours(0, 0, 0, 0);
      console.log(startDate.toISOString());

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
          fetch(`/api/dashboard/trending-topics?limit=4`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch trending topics");
            return res.json();
          }),
          fetch(`/api/dashboard/top-viewed-papers?limit=4`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch top viewed papers");
            return res.json();
          }),
          fetch(`/api/dashboard/top-search-queries?limit=4`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch top search queries");
            return res.json();
          }),
          fetch(
            `/api/trending/papers?platform=arxiv&startDate=${encodeURIComponent(
              startDate.toISOString()
            )}&limit=4`
          ).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch trending papers");
            return res.json();
          }),
          fetch(
            `/api/trending/models?startDate=${encodeURIComponent(
              startDate.toISOString()
            )}&limit=4`
          ).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch trending models");
            return res.json();
          }),
          fetch(`/api/trending/creators?limit=4`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch trending creators");
            return res.json();
          }),
          fetch(`/api/trending/authors?limit=4`).then((res) => {
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
      <Heading as="h2" size="md" mb={4}>
        {title}
      </Heading>
      <Text color="gray.500" mb={4} fontSize="sm">
        {description}
      </Text>
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

  // Define sections with their respective render functions
  const sections = [
    {
      title: "📈 Top Research Areas",
      description: "Explore the most active research areas today.",
      data: trendingData.trendingTopics,
      renderItem: (topic) => (
        <ResourceCard
          key={topic.id}
          href={`/dashboard/explore/${topic.id}`}
          title={topic.topic_name}
          description={topic.keywords.slice(0, 3).join(", ")}
          placeholderTitle="Topic"
          isLoading={isLoading}
        />
      ),
    },
    {
      title: "🏆 Most Read Papers",
      description: "Check out the most read papers of the day.",
      data: trendingData.topViewedPapers,
      renderItem: (paper) => (
        <ResourceCard
          key={paper.id}
          href={`/papers/arxiv/${paper.slug}`}
          title={paper.title}
          subtitle={`${paper.view_count} views`}
          score={paper.view_count}
          scoreLabel="Views"
          placeholderTitle="Paper"
          isLoading={isLoading}
        />
      ),
    },
    {
      title: "🔍 Top Searches",
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
          placeholderTitle="Search Query"
          isLoading={isLoading}
        />
      ),
    },
    {
      title: "📄 Breakout Papers",
      description: "Discover breakthrough papers.",
      data: trendingData.papers,
      renderItem: (paper) => (
        <ResourceCard
          key={paper.id}
          href={`/papers/${encodeURIComponent(
            paper.platform
          )}/${encodeURIComponent(paper.slug)}`}
          title={paper.title}
          score={Math.floor(paper.totalScore)}
          scoreLabel="Total Score"
          imageSrc={paper.thumbnail}
          placeholderTitle="Paper"
          isLoading={isLoading}
        />
      ),
    },
    {
      title: "👷‍♂️ Top Builders",
      description: "Learn about the top model creators.",
      data: trendingData.creators,
      renderItem: (creator) => (
        <ResourceCard
          key={creator.id || creator.uuid || creator.creator}
          href={`/creators/${encodeURIComponent(
            creator.platform
          )}/${encodeURIComponent(creator.creator)}`}
          title={creator.creator}
          subtitle={`Platform: ${creator.platform}`}
          score={formatLargeNumber(Math.floor(creator.totalCreatorScore))}
          scoreLabel="Creator Score"
          placeholderTitle="Creator"
          isLoading={isLoading}
        />
      ),
    },
    {
      title: "👩‍🔬 Star Researchers",
      description: "Meet the top researchers leading.",
      data: trendingData.authors,
      renderItem: (author) => (
        <ResourceCard
          key={author.id || author.uuid || author.author}
          href={`/authors/arxiv/${encodeURIComponent(author.author)}`}
          title={author.author}
          subtitle="Platform: arxiv"
          score={formatLargeNumber(author.totalAuthorScore)}
          scoreLabel="Author Score"
          placeholderTitle="Author"
          isLoading={isLoading}
        />
      ),
    },
    {
      title: "🤖 Trending Models",
      description: "Explore trending AI models in the industry.",
      data: trendingData.models,
      renderItem: (model) => (
        <ResourceCard
          key={model.id}
          href={`/models/${model.platform}/${encodeURIComponent(model.slug)}`}
          title={model.modelName}
          subtitle={`Creator: ${model.creator}`}
          score={formatLargeNumber(Math.floor(model.totalScore))}
          scoreLabel="Total Score"
          imageSrc={model.example}
          placeholderTitle="Model"
          isLoading={isLoading}
        />
      ),
    },
  ];

  return (
    <Box px={"5vw"} color="gray.700" py={isLargerThan480 ? 4 : 2}>
      <Heading as="h1" size="lg" mb={4}>
        Trending
      </Heading>
      <Text mb={6}>
        Discover the hottest topics, papers, models, and creators making waves
        in AI today.
      </Text>

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
