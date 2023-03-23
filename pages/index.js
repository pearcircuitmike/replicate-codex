import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";

import {
  Container,
  Heading,
  Stack,
  Text,
  Box,
  Tooltip,
  HStack,
  Show,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  VStack,
} from "@chakra-ui/react";

import ModelsTable from "./components/ModelsTable.js";
import ModelsLeaderboard from "./components/ModelsLeaderboard.js";
import MetaTags from "./components/MetaTags.js";
import CreatorsLeaderboard from "./components/CreatorsLeaderboard.js";
import Hero from "./components/Hero.js";
import GalleryView from "./components/GalleryView.js";
import testData from "./data/data.json";
import FilterTags from "./components/FilterTags";
import SearchField from "./components/SearchField";
import SortMenu from "./components/SortMenu";
import ActiveTagFilters from "./components/ActiveTagFilters";
import ActiveSorts from "./components/ActiveSorts";

const tabNameMap = {
  modelsTable: 0,
  galleryView: 1,
  creatorsLeaderboard: 2,
  modelsLeaderboard: 3,
};

const tabNameReverseMap = Object.fromEntries(
  Object.entries(tabNameMap).map(([key, value]) => [value, key])
);

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [sorts, setSorts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const router = useRouter();
  const { tab } = router.query;
  const [tabIndex, setTabIndex] = useState(0);

  const updateUrlParams = (tab, sorts, tags) => {
    const params = new URLSearchParams();

    if (tab) {
      params.set("tab", tab);
    }
    if (sorts.length > 0) {
      params.set("sorts", JSON.stringify(sorts));
    }
    if (tags.length > 0) {
      params.set("tags", JSON.stringify(tags));
    }
    window.history.pushState(
      { tab, sorts, tags },
      "",
      `/?${params.toString()}`
    );
  };

  const handleTabsChange = useCallback(
    (index) => {
      const newTabName = tabNameReverseMap[index];
      updateUrlParams(newTabName, sorts, selectedTags);
      setTabIndex(index);
    },
    [sorts, selectedTags]
  );

  useEffect(() => {
    const { tab, sorts, tags } = router.query;

    if (tab) {
      setTabIndex(tabNameMap[tab]);
    }
    if (sorts) {
      setSorts(JSON.parse(sorts));
    }
    if (tags) {
      setSelectedTags(JSON.parse(tags));
    }
  }, [router.query]);

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleTagSelect = (newSelectedTags) => {
    setSelectedTags(newSelectedTags);
    updateUrlParams(tabNameReverseMap[tabIndex], sorts, newSelectedTags);
  };

  const handleTagClose = (tag) => {
    const newSelectedTags = selectedTags.filter((value) => value !== tag);
    setSelectedTags(newSelectedTags);
    updateUrlParams(tabNameReverseMap[tabIndex], sorts, newSelectedTags);
  };

  const handleSortChange = (newSorts) => {
    setSorts(newSorts);
    updateUrlParams(tabNameReverseMap[tabIndex], newSorts, selectedTags);
  };

  const handleRemoveSort = (index) => {
    const newSorts = sorts.filter((_, i) => i !== index);
    setSorts(newSorts);
    updateUrlParams(tabNameReverseMap[tabIndex], newSorts, selectedTags);
  };

  const data = testData;

  const filteredData = data.filter(
    (item) => selectedTags.length === 0 || selectedTags.includes(item.tags)
  );

  const sortedData = filteredData.sort((a, b) => {
    for (const sort of sorts) {
      if (a[sort.column] < b[sort.column]) {
        return sort.direction === "asc" ? -1 : 1;
      }
      if (a[sort.column] > b[sort.column]) {
        return sort.direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  const models = Array.from(new Set(data.map((item) => item.tags)));

  return (
    <>
      <MetaTags
        title={"Replicate Codex | Explore and find AI models"}
        description={
          "Discover new AI models to play and build with on Replicate."
        }
      />

      <Container maxW="8xl">
        <main>
          <Hero />
          <HStack justifyContent="space-between" mb={5}>
            <SearchField
              searchValue={searchValue}
              handleSearchChange={handleSearchChange}
            />
            <HStack>
              <FilterTags
                models={models}
                selectedTags={selectedTags}
                handleTagSelect={handleTagSelect}
              />
              <SortMenu onSortChange={handleSortChange} />
            </HStack>
          </HStack>
          <VStack spacing={1} align="left">
            {selectedTags.length > 0 && (
              <ActiveTagFilters
                tags={selectedTags}
                onTagClose={handleTagClose}
              />
            )}
            {sorts.length > 0 && (
              <ActiveSorts sorts={sorts} onRemoveSort={handleRemoveSort} />
            )}
          </VStack>
          <Tabs
            index={tabIndex}
            onChange={handleTabsChange}
            colorScheme="teal"
            overflowX="auto"
          >
            <TabList mt={5}>
              <Tab>Models Table</Tab>
              <Tab>Gallery View</Tab>
              <Tab>Creators Leaderboard</Tab>
              <Tab>Models Leaderboard</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {tabIndex === 0 && (
                  <ModelsTable data={sortedData} searchValue={searchValue} />
                )}
              </TabPanel>
              <TabPanel>
                {tabIndex === 1 && (
                  <GalleryView data={sortedData} searchValue={searchValue} />
                )}
              </TabPanel>
              <TabPanel>
                {tabIndex === 2 && (
                  <CreatorsLeaderboard
                    data={sortedData}
                    searchValue={searchValue}
                  />
                )}
              </TabPanel>
              <TabPanel>
                {tabIndex === 3 && (
                  <ModelsLeaderboard
                    data={sortedData}
                    searchValue={searchValue}
                  />
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </main>
      </Container>
    </>
  );
}
