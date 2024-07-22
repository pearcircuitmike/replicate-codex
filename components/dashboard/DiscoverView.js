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
  useMediaQuery,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Feed from "../Feed/Feed";
import SearchBar from "../SearchBar";
import TopSearchQueries from "../TopSearchQueries";
import { formatLargeNumber } from "@/pages/api/utils/formatLargeNumber";

const DiscoverView = () => {
  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [resultCounts, setResultCounts] = useState({
    papers: null,
    models: null,
  });
  const [searchParams, setSearchParams] = useState({ searchValue: "" });
  const [isLargerThan480] = useMediaQuery("(min-width: 480px)");
  const [isLargerThan1024] = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();

  useEffect(() => {
    if (router.query.q) {
      setSearchInput(router.query.q);
      handleSearch(router.query.q);
    }
  }, [router.query.q]);

  const handleSearch = useCallback(
    (value = searchInput) => {
      setIsSearching(true);
      setSearchParams({ searchValue: value });
      router.push(
        `/dashboard/discover?q=${encodeURIComponent(value)}`,
        undefined,
        { shallow: true }
      );
      setTimeout(() => setIsSearching(false), 500);
    },
    [searchInput, router]
  );

  const updateResultCount = useCallback((type, count) => {
    setResultCounts((prev) => ({ ...prev, [type]: count }));
  }, []);

  const handleSearchQuery = (query) => {
    setSearchInput(query);
    handleSearch(query);
  };

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
          <SearchBar
            searchValue={searchInput}
            setSearchValue={setSearchInput}
            onSearchSubmit={() => handleSearch()}
            placeholder="Search papers and models..."
            resourceType="discover"
          />
        </Box>
      </Box>
      <Box flex={1} overflowY="auto">
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
                resourceType="papers"
                fetchParams={searchParams}
                updateResultCount={updateResultCount}
                isSearching={isSearching}
              />
            </TabPanel>
            <TabPanel p={0}>
              <Feed
                resourceType="models"
                fetchParams={searchParams}
                updateResultCount={updateResultCount}
                isSearching={isSearching}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </VStack>
  );
};

export default DiscoverView;
