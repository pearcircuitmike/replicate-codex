import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useRef } from "react"; // Import useRef

import {
  Container,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  useMediaQuery,
} from "@chakra-ui/react";

import ModelsTable from "./components/ModelsTable.js";
import ModelsLeaderboard from "./components/ModelsLeaderboard.js";
import MetaTags from "./components/MetaTags.js";
import CreatorsLeaderboard from "./components/CreatorsLeaderboard.js";
import Hero from "./components/Hero.js";
import GalleryView from "./components/GalleryView.js";
import FilterTags from "./components/tableControls/FilterTags";
import SearchField from "./components/tableControls/SearchField";
import SortMenu from "./components/tableControls/SortMenu";
import ActiveTagFilters from "./components/tableControls/ActiveTagFilters";
import ActiveSorts from "./components/tableControls/ActiveSorts";

import { fetchDataFromTable } from "../utils/supabaseClient";

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
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const { tab } = router.query;
  const [tabIndex, setTabIndex] = useState(0);
  const [data, setData] = useState([]);
  const [isMobile] = useMediaQuery("(max-width: 480px)");

  const scrollRef = useRef(null); // Create a ref to store the scroll position

  useEffect(() => {
    async function getData() {
      const { data, count } = await fetchDataFromTable({
        tableName: "modelsData",
        tags: selectedTags,
        searchValue,
        sorts,
        pageSize: 10,
        currentPage: 1,
      });
      setData(data);
    }
    getData();
  }, [searchValue, selectedTags, sorts]);
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
    // Use replace with shallow option set to true and scroll option set to false
    router.replace(`/?${params.toString()}`, undefined, {
      shallow: true,
      scroll: false,
    });
  };

  const handleTabsChange = useCallback(
    (index) => {
      const newTabName = tabNameReverseMap[index];
      updateUrlParams(newTabName, sorts, selectedTags);
      setTabIndex(index);
    },
    [sorts, selectedTags]
  );

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

  useEffect(() => {
    const handleRouteChange = (url) => {
      const params = new URLSearchParams(url.split("?")[1]);
      const tab = params.get("tab");
      const sorts = params.get("sorts");
      const tags = params.get("tags");

      if (tab) {
        setTabIndex(tabNameMap[tab]);
      }
      if (sorts) {
        setSorts(JSON.parse(sorts));
      }
      if (tags) {
        setSelectedTags(JSON.parse(tags));
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  const models = Array.from(new Set(data.map((item) => item.tags)));

  return (
    <>
      <MetaTags
        title={"Replicate Codex - AI model details"}
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
            size={isMobile ? "sm" : "md"}
          >
            <TabList mt={isMobile ? 0 : 5}>
              <Tab>Table</Tab>
              <Tab>Gallery</Tab>
              <Tab>Creators</Tab>
              {/*    <Tab>Leaderboard</Tab> */}
            </TabList>
            <TabPanels>
              <TabPanel pl={0} pr={0} size={isMobile ? "sm" : "md"}>
                <ModelsTable
                  fetchFilteredData={fetchDataFromTable}
                  selectedTags={selectedTags}
                  searchValue={searchValue}
                  sorts={sorts}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </TabPanel>
              <TabPanel pl={0} pr={0}>
                <GalleryView
                  fetchFilteredData={fetchDataFromTable}
                  selectedTags={selectedTags}
                  searchValue={searchValue}
                  sorts={sorts}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </TabPanel>
              <TabPanel pl={0} pr={0}>
                <CreatorsLeaderboard searchValue={searchValue} />
              </TabPanel>
              {/*   <TabPanel pl={0} pr={0}>
                {tabIndex === 3 && <ModelsLeaderboard data={data} />}
              </TabPanel>*/}
            </TabPanels>
          </Tabs>
        </main>
      </Container>
    </>
  );
}
