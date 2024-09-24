// components/Dashboard/Views/TrendingView.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  useMediaQuery,
  Spinner,
} from "@chakra-ui/react";
import TrendingTopics from "@/components/TrendingTopics";
import TopViewedPapers from "@/components/TopViewedPapers";
import TopSearchQueries from "@/components/TopSearchQueries";
import LandingPageTrending from "@/components/LandingPageTrending";
import {
  fetchTrendingPapers,
  fetchTrendingModels,
  fetchTrendingCreators,
  fetchTrendingAuthors,
} from "@/pages/api/utils/fetchLandingPageData";

const TrendingView = () => {
  const [isLargerThan480] = useMediaQuery("(min-width: 480px)");
  const [trendingData, setTrendingData] = useState({
    models: [],
    papers: [],
    creators: [],
    authors: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const getStartOfWeek = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek;
  };

  useEffect(() => {
    async function fetchData() {
      const startDate = getStartOfWeek(new Date());

      try {
        const [papers, models, creators, authors] = await Promise.all([
          fetchTrendingPapers("arxiv", startDate, 4),
          fetchTrendingModels(startDate, 4),
          fetchTrendingCreators(startDate, 4),
          fetchTrendingAuthors(4),
        ]);

        setTrendingData({
          papers,
          models,
          creators,
          authors,
        });
      } catch (error) {
        console.error("Error fetching trending data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Box p={isLargerThan480 ? 4 : 2}>
      <Heading as="h1" size="lg" mb={2}>
        Trending
      </Heading>
      <Text mb={4}>
        Discover the hottest topics, papers, models, and creators making waves
        in AI today.
      </Text>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <TrendingTopics />
        <TopViewedPapers />
        <TopSearchQueries />
      </SimpleGrid>
      {isLoading ? (
        <Spinner size="xl" alignSelf="center" />
      ) : (
        <LandingPageTrending
          trendingModels={trendingData.models}
          trendingPapers={trendingData.papers}
          trendingCreators={trendingData.creators}
          trendingAuthors={trendingData.authors}
          isLoading={isLoading}
        />
      )}
    </Box>
  );
};

export default TrendingView;
