// components/Dashboard/Views/TrendingView.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  useMediaQuery,
  Spinner,
  VStack,
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

  // Helper function to get the start of the week
  const getStartOfWeek = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };

  useEffect(() => {
    async function fetchData() {
      const startDate = getStartOfWeek(new Date());

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
          fetch(`/api/dashboard/trending-topics?limit=5`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch trending topics");
            return res.json();
          }),
          fetch(`/api/dashboard/top-viewed-papers?limit=5`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch top viewed papers");
            return res.json();
          }),
          fetch(`/api/dashboard/top-search-queries?limit=5`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch top search queries");
            return res.json();
          }),
          fetch(
            `/api/trending/papers?platform=arxiv&startDate=${encodeURIComponent(
              startDate.toISOString()
            )}&limit=5`
          ).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch trending papers");
            return res.json();
          }),
          fetch(
            `/api/trending/models?startDate=${encodeURIComponent(
              startDate.toISOString()
            )}&limit=5`
          ).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch trending models");
            return res.json();
          }),
          fetch(`/api/trending/creators?limit=5`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch trending creators");
            return res.json();
          }),
          fetch(`/api/trending/authors?limit=5`).then((res) => {
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

  // Configuration for each trending section
  const sections = [
    {
      title: "📈 Top Research Areas",
      description: "Explore the most active research areas today.",
      data: trendingData.trendingTopics,
      isLoading,
      renderCard: (topic) => ({
        href: `/dashboard/explore/${topic.id}`,
        title: topic.topic_name,
        description: topic.keywords.slice(0, 3).join(", "),
        subtitle: undefined,
        score: undefined,
        scoreLabel: "Score",
        imageSrc: undefined,
        placeholderTitle: "Topic",
      }),
    },
    {
      title: "🏆 Most Read Papers",
      description: "Check out the most read papers of the day.",
      data: trendingData.topViewedPapers,
      isLoading,
      renderCard: (paper) => ({
        href: `/papers/arxiv/${paper.slug}`,
        title: paper.title,
        description: undefined,
        subtitle: `${paper.view_count} views`,
        score: undefined,
        scoreLabel: "Views",
        imageSrc: undefined,
        placeholderTitle: "Paper",
      }),
    },
    {
      title: "🔍 Top Searches",
      description: "See what the community is searching for.",
      data: trendingData.topSearchQueries,
      isLoading,
      renderCard: (query) => ({
        href: `/dashboard/discover?q=${encodeURIComponent(query.search_query)}`,
        title: query.search_query,
        description: undefined,
        subtitle: `Type: ${query.resource_type}`,
        score: undefined,
        scoreLabel: "Searches",
        imageSrc: undefined,
        placeholderTitle: "Search Query",
      }),
    },
    {
      title: "📄 Breakout Papers",
      description: "Discover breakthrough papers.",
      data: trendingData.papers,
      isLoading,
      renderCard: (paper) => ({
        href: `/papers/${encodeURIComponent(
          paper.platform
        )}/${encodeURIComponent(paper.slug)}`,
        title: paper.title,
        description: undefined,
        subtitle: undefined,
        score: Math.floor(paper.totalScore),
        scoreLabel: "Total Score",
        imageSrc: paper.thumbnail,
        placeholderTitle: "Paper",
      }),
    },
    {
      title: "👩‍🔬 Star Researchers",
      description: "Meet the top researchers leading.",
      data: trendingData.authors,
      isLoading,
      renderCard: (author) => ({
        href: `/authors/arxiv/${encodeURIComponent(author.author)}`,
        title: author.author,
        description: undefined,
        subtitle: "Platform: arxiv",
        score: formatLargeNumber(author.totalAuthorScore),
        scoreLabel: "Author Score",
        imageSrc: undefined,
        placeholderTitle: "Author",
      }),
    },
    {
      title: "🤖 Trending Models",
      description: "Explore trending AI models in the industry.",
      data: trendingData.models,
      isLoading,
      renderCard: (model) => ({
        href: `/models/${model.platform}/${encodeURIComponent(model.slug)}`,
        title: model.modelName,
        description: undefined,
        subtitle: `Creator: ${model.creator}`,
        score: formatLargeNumber(Math.floor(model.totalScore)),
        scoreLabel: "Total Score",
        imageSrc: model.example,
        placeholderTitle: "Model",
      }),
    },
    {
      title: "👷‍♂️ Top Builders",
      description: "Learn about the top model creators.",
      data: trendingData.creators,
      isLoading,
      renderCard: (creator) => ({
        href: `/creators/${encodeURIComponent(
          creator.platform
        )}/${encodeURIComponent(creator.creator)}`,
        title: creator.creator,
        description: undefined,
        subtitle: `Platform: ${creator.platform}`,
        score: formatLargeNumber(Math.floor(creator.totalCreatorScore)),
        scoreLabel: "Creator Score",
        imageSrc: undefined,
        placeholderTitle: "Creator",
      }),
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

      {isLoading ? (
        <Spinner size="xl" alignSelf="center" />
      ) : (
        <SimpleGrid
          columns={{ base: 1, sm: 1, md: 2, lg: 4 }}
          spacing={6}
          mb={6}
        >
          {sections.map((section, index) => (
            <Box key={index}>
              {/* Section Header */}
              <Heading as="h2" size="md" mt={6}>
                {section.title}
              </Heading>
              {/* Section Description */}
              <Text color="gray.500" mb={4} fontSize="sm">
                {section.description}
              </Text>
              {/* Resource Cards */}
              <VStack spacing={4} align="stretch">
                {section.data.length > 0 ? (
                  section.data.map((item, idx) => (
                    <ResourceCard
                      key={
                        item.id ||
                        item.uuid ||
                        item.author ||
                        item.slug ||
                        `${section.title}-${index}-${idx}`
                      }
                      {...section.renderCard(item)}
                      isLoading={section.isLoading}
                    />
                  ))
                ) : (
                  <Text>No data available.</Text>
                )}
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default TrendingView;
