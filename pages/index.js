import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useRef } from "react";
import {
  Container,
  HStack,
  VStack,
  useMediaQuery,
  Skeleton,
} from "@chakra-ui/react";

import ModelsTable from "../components/ModelsTable.js";
import MetaTags from "../components/MetaTags.js";
import CreatorsLeaderboard from "../components/CreatorsLeaderboard.js";
import Hero from "../components/Hero.js";
import GalleryView from "../components/GalleryView.js";
import FilterTags from "../components/tableControls/FilterTags.js";
import SearchField from "../components/tableControls/SearchField.js";
import SortMenu from "../components/tableControls/SortMenu.js";
import ActiveTagFilters from "../components/tableControls/ActiveTagFilters.js";
import ActiveSorts from "../components/tableControls/ActiveSorts.js";

import { fetchDataFromTable } from "../utils/modelsData.js";

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [sorts, setSorts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const [tabIndex, setTabIndex] = useState(0);
  const [data, setData] = useState([]);
  const [isMobile] = useMediaQuery("(max-width: 480px)");
  const [isLoading, setIsLoading] = useState(true);

  const scrollRef = useRef(null);

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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Fetch data from the table
        const tableData = await fetchDataFromTable();

        setData(tableData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedTags, searchValue, sorts, currentPage]);

  const models = Array.from(
    new Set(Array.isArray(data) ? data.map((item) => item.tags) : [])
  );

  if (isLoading) {
    return (
      <>
        <MetaTags
          title={"AIModels.fyi - AI model details"}
          description={
            "Discover AI models to play and build with on platforms like Replicate, Cerebrium, HuggingFace, and more."
          }
        />

        <Container maxW="8xl">
          <main>
            <Skeleton height="80px" mb={5} />
            <HStack justifyContent="space-between" mb={5}>
              <Skeleton width="150px" height="40px" />
              <Skeleton width="150px" height="40px" />
            </HStack>
            <VStack spacing={1} align="left">
              <Skeleton width="150px" height="30px" />
              <Skeleton width="150px" height="30px" />
            </VStack>
            <Skeleton height="500px" my={5} />
          </main>
        </Container>
      </>
    );
  }

  return (
    <>
      <MetaTags
        title={"AIModels.fyi - AI model details"}
        description={
          "Discover AI models to play and build with on platforms like Replicate, Cerebrium, HuggingFace, and more."
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

          <ModelsTable
            fetchFilteredData={fetchDataFromTable}
            tableName={"combinedModelsData"}
            selectedTags={selectedTags}
            searchValue={searchValue}
            sorts={sorts}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </main>
      </Container>
    </>
  );
}
