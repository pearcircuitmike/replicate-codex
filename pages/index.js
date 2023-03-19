import Head from "next/head";
import { useState, useEffect } from "react";
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

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [sorts, setSorts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const router = useRouter();
  const { tab } = router.query;

  const handleTabsChange = (index) => {
    router.push({ pathname: "/", query: { tab: index } });
  };
  useEffect(() => {
    if (tab) {
      handleTabsChange(parseInt(tab));
    }
  }, [tab]);

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleTagSelect = (newSelectedTags) => {
    setSelectedTags(newSelectedTags);
  };
  const handleTagClose = (tag) => {
    const newSelectedTags = selectedTags.filter((value) => value !== tag);
    setSelectedTags(newSelectedTags);
  };
  const handleRemoveSort = (index) => {
    const newSorts = sorts.filter((_, i) => i !== index);
    setSorts(newSorts);
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
              <SortMenu onSortChange={(newSorts) => setSorts(newSorts)} />
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
          <Tabs index={tab ? parseInt(tab) : 0} onChange={handleTabsChange}>
            <TabList>
              <Tab>Models Table</Tab>
              <Tab>Gallery View</Tab>
              <Tab>Creators Leaderboard</Tab>
              <Tab>Models Leaderboard</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <ModelsTable data={sortedData} searchValue={searchValue} />
              </TabPanel>
              <TabPanel>
                <GalleryView data={sortedData} searchValue={searchValue} />
              </TabPanel>
              <TabPanel>
                <CreatorsLeaderboard
                  data={sortedData}
                  searchValue={searchValue}
                />
              </TabPanel>
              <TabPanel>
                <ModelsLeaderboard
                  data={sortedData}
                  searchValue={searchValue}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </main>
      </Container>
    </>
  );
}
