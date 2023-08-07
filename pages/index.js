import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, useMediaQuery, HStack } from "@chakra-ui/react";

import ModelsTable from "../components/ModelsTable.js";
import MetaTags from "../components/MetaTags.js";
import Hero from "../components/Hero.js";
import ModelOfTheDay from "../components/ModelOfTheDay"; // Import the ModelOfTheDay component
import ModelMatchmaker from "@/components/ModelMatchmaker.js";

import { fetchDataFromTable } from "../utils/modelsData.js";

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [sorts, setSorts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const [isMobile] = useMediaQuery("(max-width: 480px)");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Execute the JavaScript code here
    const script = document.createElement("script");
    script.innerHTML = `
      window.SubstackFeedWidget = {
        substackUrl: "aimodels.substack.com",
        posts: 3
      };
    `;
    document.body.appendChild(script);

    const feedScript = document.createElement("script");
    feedScript.src = "https://substackapi.com/embeds/feed.js";
    feedScript.async = true;
    document.body.appendChild(feedScript);

    return () => {
      // Clean up the dynamically added script tags
      document.body.removeChild(script);
      document.body.removeChild(feedScript);
    };
  }, []);

  return (
    <>
      <MetaTags
        title={"AIModels.fyi - Find the best AI model for your startup"}
        description={
          "Free, no account needed. Describe your product and get the best AI model. Compares 250,000 AI models from Replicate, HuggingFace, and more."
        }
      />

      <Container maxW="8xl">
        <main>
          <Hero />

          <ModelMatchmaker />

          {/* <ModelsTable
            fetchFilteredData={fetchDataFromTable}
            tableName={"combinedModelsData"}
            selectedTags={selectedTags}
            searchValue={searchValue}
            sorts={sorts}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />*/}
        </main>
      </Container>
    </>
  );
}
