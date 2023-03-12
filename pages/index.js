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

import Hero from "./components/Hero.js";
import GalleryView from "./components/GalleryView.js";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [searchedVal, setSearchedVal] = useState("");

  return (
    <>
      <Head>
        <meta httpEquiv="content-language" content="en-gb" />

        <title>Replicate Codex | Explore and find AI models</title>
        <meta
          name="description"
          content="Search, filter, sort and explore AI models on the Replicate platform."
        />

        <meta
          property="og:title"
          content="Replicate Codex | Explore and find AI models"
        />
        <meta
          property="og:description"
          content="Search, filter, sort and explore AI models on the Replicate platform."
        />

        <meta property="og:url" content="https://replicatecodex.com" />
        <meta
          property="og:image"
          content="https://replicatecodex.com/socialImg.png"
        />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:description"
          content="Search, filter, sort and explore AI models on the Replicate platform."
        />
        <meta
          property="twitter:image"
          content="https://replicatecodex.com/socialImg.png"
        />

        <link rel="icon" href="/favicon.ico" />
      </Head>
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
