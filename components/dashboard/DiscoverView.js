import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  VStack,
  Spinner,
  useMediaQuery,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Feed from "../Feed/Feed";
import SemanticSearchBar from "../SemanticSearchBar";
import TimeRangeFilter from "../TimeRangeFilter";
import { formatLargeNumber } from "@/pages/api/utils/formatLargeNumber";

const DiscoverView = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [resultCounts, setResultCounts] = useState({
    papers: null,
    models: null,
  });
  const [searchParams, setSearchParams] = useState({
    timeRange: "allTime",
  });
  const [searchResults, setSearchResults] = useState({
    papers: [],
    models: [],
  });
  const [isLargerThan480] = useMediaQuery("(min-width: 480px)");
  const router = useRouter();
  const latestSearchValueRef = useRef("");

  const updateResultCount = (type, count) => {
    setResultCounts((prev) => ({ ...prev, [type]: count }));
  };

  const handleSearch = async (value) => {
    const trimmedQuery = value.trim();
    latestSearchValueRef.current = trimmedQuery;

    if (trimmedQuery === "") {
      setSearchResults({ papers: [], models: [] });
      updateResultCount("papers", 0);
      updateResultCount("models", 0);
      return;
    }

    setIsSearching(true);

    const requestBody = {
      query: trimmedQuery,
      similarityThreshold: 0.7,
      matchCount: 20,
      timeRange: searchParams.timeRange, // Always uses the latest timeRange
    };

    try {
      // Fetch both papers and models
      const [papersResponse, modelsResponse] = await Promise.all([
        fetch("/api/search/semantic-search-papers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }),
        fetch("/api/search/semantic-search-models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }),
      ]);

      if (!papersResponse.ok || !modelsResponse.ok) {
        throw new Error(
          `Search failed with status: Papers ${papersResponse.status}, Models ${modelsResponse.status}`
        );
      }

      const [papersData, modelsData] = await Promise.all([
        papersResponse.json(),
        modelsResponse.json(),
      ]);

      // Check if the search value has changed since the request was sent
      if (trimmedQuery !== latestSearchValueRef.current) {
        // Ignore outdated response
        return;
      }

      updateResultCount("papers", papersData.data.length);
      updateResultCount("models", modelsData.data.length);

      setSearchResults({
        papers: papersData.data,
        models: modelsData.data,
      });
    } catch (error) {
      console.error("Error in semantic search:", error);
      // Optionally handle error state here
    } finally {
      setIsSearching(false);
    }
  };

  const handleTimeRangeChange = (timeRange) => {
    setSearchParams((prevParams) => ({ ...prevParams, timeRange }));
  };

  useEffect(() => {
    if (latestSearchValueRef.current.trim() !== "") {
      handleSearch(latestSearchValueRef.current);
    }
  }, [searchParams.timeRange]); // Retrigger search when timeRange changes

  useEffect(() => {
    // On initial mount, check if there's a query parameter
    if (router.query.q) {
      const initialQuery = router.query.q;
      latestSearchValueRef.current = initialQuery;
      handleSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return (
    <VStack
      height="100%"
      spacing={4}
      align="stretch"
      p={isLargerThan480 ? 4 : 2}
    >
      <Box>
        <Heading as="h1" size="lg" mb={2}>
          Discover
        </Heading>
        {isLargerThan480 && (
          <Text mb={4}>
            Explore the latest AI breakthroughs and trending research.
          </Text>
        )}
        <Box mb={4}>
          <SemanticSearchBar
            onSearchSubmit={handleSearch}
            placeholder="Search papers and models..."
            initialSearchValue={router.query.q || ""}
          />
        </Box>
        <TimeRangeFilter
          selectedTimeRange={searchParams.timeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />
      </Box>
      <Box flex={1} overflowY="auto">
        {isSearching ? (
          <Spinner size="xl" alignSelf="center" />
        ) : resultCounts.papers === 0 && resultCounts.models === 0 ? (
          <Text>
            No results found. Please try a different query or adjust your
            filters.
          </Text>
        ) : (
          <Tabs
            index={activeTab}
            onChange={(index) => setActiveTab(index)}
            variant="enclosed-colored"
          >
            <TabList marginBottom={5}>
              <Tab flex={1}>
                Papers{" "}
                {resultCounts.papers !== null
                  ? `(${formatLargeNumber(resultCounts.papers)})`
                  : ""}
              </Tab>
              <Tab flex={1}>
                Models{" "}
                {resultCounts.models !== null
                  ? `(${formatLargeNumber(resultCounts.models)})`
                  : ""}
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <Feed resourceType="paper" results={searchResults.papers} />
              </TabPanel>
              <TabPanel p={0}>
                <Feed resourceType="model" results={searchResults.models} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </Box>
    </VStack>
  );
};

export default DiscoverView;
