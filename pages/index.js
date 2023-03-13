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

import Hero from "./components/Hero.js";
import GalleryView from "./components/GalleryView.js";

export default function Home() {
  const [searchedVal, setSearchedVal] = useState("");

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
          <Tabs colorScheme="teal">
            <TabList>
              <Tab>List view</Tab>
              <Tab>Gallery</Tab>
              <Tab>Top Models</Tab>
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
            </TabPanels>
          </Tabs>
        </main>
      </Container>
    </>
  );
}
