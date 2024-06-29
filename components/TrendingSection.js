import React, { useState, useEffect } from "react";
import { Box, Heading, Text, HStack, Spacer, Button } from "@chakra-ui/react";
import {
  fetchTrendingPapers,
  fetchTrendingModels,
  fetchTrendingCreators,
  fetchTrendingAuthors,
} from "../utils/fetchLandingPageData";
import LandingPageTrending from "./LandingPageTrending";

const getStartOfWeek = (date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  return startOfWeek;
};

const TrendingSection = () => {
  const [startDate, setStartDate] = useState(getStartOfWeek(new Date()));
  const [trendingData, setTrendingData] = useState({
    trendingPapers: [],
    trendingModels: [],
    trendingCreators: [],
    trendingAuthors: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrendingData(startDate);
  }, [startDate]);

  const fetchTrendingData = async (date) => {
    setIsLoading(true);
    try {
      const trendingPapers = await fetchTrendingPapers("arxiv", date);
      const trendingModels = await fetchTrendingModels(date);
      const trendingCreators = await fetchTrendingCreators(date);
      const trendingAuthors = await fetchTrendingAuthors("arxiv", date);
      setTrendingData({
        trendingPapers,
        trendingModels,
        trendingCreators,
        trendingAuthors,
      });
    } catch (error) {
      console.error("Error fetching trending data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevWeek = () => {
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - 7);
    setStartDate(prevStartDate);
  };

  const handleNextWeek = () => {
    const nextStartDate = new Date(startDate);
    nextStartDate.setDate(nextStartDate.getDate() + 7);
    const currentDate = getStartOfWeek(new Date());
    if (nextStartDate <= currentDate) {
      setStartDate(nextStartDate);
    }
  };

  return (
    <Box>
      <Heading as="h2" size="xl" mb={4}>
        Trending Research
      </Heading>
      <Text fontSize="xl" mb={3}>
        Explore the most popular and trending AI research, as measured by stars,
        upvotes, likes, and more.
      </Text>

      <Text mb={4}>
        Week: {startDate.toLocaleDateString()} -{" "}
        {new Date(
          startDate.getTime() + 7 * 24 * 60 * 60 * 1000
        ).toLocaleDateString()}
      </Text>

      <HStack my={8}>
        <Button onClick={handlePrevWeek}>Previous Week</Button>
        <Spacer />
        <Button
          onClick={handleNextWeek}
          isDisabled={
            new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) >
            getStartOfWeek(new Date())
          }
        >
          Next Week
        </Button>
      </HStack>

      <LandingPageTrending
        trendingModels={trendingData.trendingModels}
        trendingPapers={trendingData.trendingPapers}
        trendingCreators={trendingData.trendingCreators}
        trendingAuthors={trendingData.trendingAuthors}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default TrendingSection;
