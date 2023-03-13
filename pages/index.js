import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useState, useEffect } from "react";

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
} from "@chakra-ui/react";

import ModelsTable from "./components/ModelsTable.js";
import ModelsLeaderboard from "./components/ModelsLeaderboard.js";
import Table from "./components/ModelsTable.js";
import MetaTags from "./components/MetaTags.js";
import CreatorsLeaderboard from "./components/CreatorsLeaderboard.js";
import Hero from "./components/Hero.js";
import GalleryView from "./components/GalleryView.js";

export default function Home() {
  const [searchedVal, setSearchedVal] = useState("");
  const [activeTab, setActiveTab] = useState(
    typeof window !== "undefined" && window.localStorage
      ? parseInt(
          localStorage.getItem("activeTab") === null
            ? 0
            : localStorage.getItem("activeTab")
        )
      : 0
  );

  // Load the active tab index from local storage on page load
  useEffect(() => {
    const storedTab = localStorage.getItem("activeTab");
    if (storedTab !== null) {
      setActiveTab(parseInt(localStorage.getItem("activeTab")));
    }
  }, []);

  // Save the active tab index to local storage when it changes
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab.toString());
  }, [activeTab]);

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
          <Box maxW="500px" mb={5}>
            <Input
              variant="outline"
              placeholder="Search by model name, creator, tag, etc..."
              onChange={(e) => setSearchedVal(e.target.value)}
            />
          </Box>
          <Tabs
            colorScheme="teal"
            index={activeTab}
            onChange={(index) => setActiveTab(index)}
          >
            <TabList>
              <Tab>List view</Tab>
              <Tab>Gallery</Tab>
              <Tab>Top Models</Tab>
              <Tab>Top Creators</Tab>
            </TabList>

            <TabPanels>
              <TabPanel pl={0}>
                <Table searchedVal={searchedVal} />
              </TabPanel>
              <TabPanel>
                <GalleryView searchedVal={searchedVal} />
              </TabPanel>
              <TabPanel>
                <ModelsLeaderboard searchedVal={searchedVal} />
              </TabPanel>
              <TabPanel>
                <CreatorsLeaderboard searchedVal={searchedVal} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </main>
      </Container>
    </>
  );
}
