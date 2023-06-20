import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useRef } from "react";
import { Container, HStack, VStack, useMediaQuery } from "@chakra-ui/react";

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
