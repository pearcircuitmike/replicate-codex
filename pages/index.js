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
import Hero from "./components/Hero.js";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [searchedVal, setSearchedVal] = useState("");

  return (
    <>
      <Head>
        <title>Replicate Codex</title>
        <meta
          name="description"
          content="Search, filter, sort, and explore Replicate AI models"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
          <Tabs>
            <TabList>
              <Tab>List view</Tab>
              <Tab>Gallery</Tab>
              <Tab>Three</Tab>
            </TabList>

            <TabPanels>
              <TabPanel pl={0}>
                <ModelsTable searchedVal={searchedVal} />
              </TabPanel>
              <TabPanel>
                <p>two!</p>
              </TabPanel>
              <TabPanel>
                <p>three!</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </main>
      </Container>
    </>
  );
}
