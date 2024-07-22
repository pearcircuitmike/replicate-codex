import React, { useState, useCallback } from "react";
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
import Feed from "../Feed/Feed";
import SearchBar from "../SearchBar";
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

  const handleSearch = useCallback(() => {
    setIsSearching(true);
    setSearchParams({ searchValue: searchInput });
    setTimeout(() => setIsSearching(false), 500);
  }, [searchInput]);

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
          <SearchBar
            searchValue={searchInput}
            setSearchValue={setSearchInput}
            onSearchSubmit={handleSearch}
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
