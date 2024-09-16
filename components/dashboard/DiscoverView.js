import React, { useState, useCallback, useEffect } from "react";
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
  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [resultCounts, setResultCounts] = useState({
    papers: null,
    models: null,
  });
  const [searchParams, setSearchParams] = useState({
    searchValue: "",
    timeRange: "allTime",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isLargerThan480] = useMediaQuery("(min-width: 480px)");
  const router = useRouter();

  useEffect(() => {
    if (router.query.q) {
      setSearchInput(router.query.q);
      handleSearch(router.query.q);
    }
  }, [router.query.q]);

  const handleSearch = useCallback(
    async (inputQuery = null) => {
      setIsSearching(true);
      const queryToSearch = inputQuery !== null ? inputQuery : searchInput;
      const trimmedQuery =
        typeof queryToSearch === "string" ? queryToSearch.trim() : "";

      const requestBody = {
        query: trimmedQuery,
        similarityThreshold: 0.7,
        matchCount: 20,
        timeRange: searchParams.timeRange,
      };

      try {
        const endpoint =
          activeTab === 0
            ? "/api/search/semantic-search-papers"
            : "/api/search/semantic-search-models";

        console.log("Sending request to:", endpoint);
        console.log("Request body:", requestBody);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Search failed with status: ${response.status}`);
        }

        const { data } = await response.json();
        console.log("Received data:", data);

        setSearchParams((prev) => ({
          ...prev,
          searchValue: trimmedQuery,
        }));
        router.push(
          `/dashboard/discover?q=${encodeURIComponent(trimmedQuery)}`,
          undefined,
          { shallow: true }
        );
        updateResultCount(activeTab === 0 ? "papers" : "models", data.length);
        setSearchResults(data);
      } catch (error) {
        console.error("Error in semantic search:", error);
        // Optionally handle error state here
      } finally {
        setIsSearching(false);
      }
    },
    [searchInput, router, searchParams.timeRange, activeTab]
  );

  const handleTimeRangeChange = useCallback(
    (timeRange) => {
      setSearchParams((prevParams) => ({ ...prevParams, timeRange }));
      handleSearch();
    },
    [handleSearch]
  );

  const updateResultCount = useCallback((type, count) => {
    setResultCounts((prev) => ({ ...prev, [type]: count }));
  }, []);

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
            searchValue={searchInput}
            setSearchValue={setSearchInput}
            onSearchSubmit={handleSearch}
            placeholder="Search papers and models..."
            resourceType={activeTab === 0 ? "paper" : "model"}
            selectedTimeRange={searchParams.timeRange}
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
                <Feed
                  resourceType="paper"
                  fetchParams={searchParams}
                  updateResultCount={updateResultCount}
                  isSearching={isSearching}
                  searchResults={searchResults}
                />
              </TabPanel>
              <TabPanel p={0}>
                <Feed
                  resourceType="model"
                  fetchParams={searchParams}
                  updateResultCount={updateResultCount}
                  isSearching={isSearching}
                  searchResults={searchResults}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </Box>
    </VStack>
  );
};

export default DiscoverView;
