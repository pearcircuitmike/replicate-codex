import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  useMediaQuery,
  HStack,
  Grid,
  VStack,
  Heading,
  Text,
  Link,
  Box,
  Flex,
  Image,
  Center,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";

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

      <Container maxW="8xl" mt="100px">
        <main>
          <Grid templateColumns={["1fr", "1fr 1fr"]} gap={16} mt={8} mb={16}>
            {/* Left Column */}
            <VStack align="start" spacing={4}>
              <Heading
                as="h1"
                fontSize={isMobile ? "3xl" : "4xl"}
                fontWeight="bold"
              >
                Describe your problem. Get an AI that can solve it.
              </Heading>
              <ModelMatchmaker />
              <Text color="gray.500">Or try these popular searches:</Text>
              <List spacing={1}>
                <ListItem>
                  <Link
                    color="blue.500"
                    textDecoration="underline"
                    href="/results?query=Turn%20my%20profile%20picture%20into%20a%20Studio%20Ghibli%20illustration"
                  >
                    <ListIcon as={ArrowForwardIcon} color="blue.500" />
                    Turn my profile picture into a Studio Ghibli illustration
                  </Link>
                </ListItem>
                <ListItem>
                  <Link
                    color="blue.500"
                    textDecoration="underline"
                    href="/results?query=3D%20or%20point-cloud%20shapes%20or%20models"
                  >
                    <ListIcon as={ArrowForwardIcon} color="blue.500" />
                    AI 3D model generators
                  </Link>
                </ListItem>
                <ListItem>
                  <Link
                    color="blue.500"
                    textDecoration="underline"
                    href="/results?query=Text-to-speech%20for%20a%20virtual%20assistant%20chatbot"
                  >
                    <ListIcon as={ArrowForwardIcon} color="blue.500" />
                    Text-to-speech for a virtual assistant chatbot
                  </Link>
                </ListItem>
                <ListItem>
                  <Link
                    color="blue.500"
                    textDecoration="underline"
                    href="/results?query=Best%20AI%20for%20logo%20design"
                  >
                    <ListIcon as={ArrowForwardIcon} color="blue.500" />
                    Best AI for logo design
                  </Link>
                </ListItem>
              </List>
              <Box>
                <Flex wrap="wrap" alignItems="center" my="100px">
                  <Center>
                    <Text display="inline-block">As seen on:</Text>
                  </Center>

                  <Center mx={2}>
                    <Link href="https://hackernoon.com/nightmareai-a-peek-at-their-best-models">
                      <Image
                        src="/img/logos/media/hackerNoonLogo.webp"
                        alt="hackerNoonLogo"
                        height="1.3em"
                        objectFit="contain"
                      />
                    </Link>
                  </Center>

                  <Center mx={2}>
                    <Link href="https://medium.com/p/ff04e7ae7215">
                      <Image
                        src="/img/logos/media/betterProgrammingLogo.webp"
                        alt="betterProgrammingLogo"
                        height="1.3em"
                        objectFit="contain"
                      />
                    </Link>
                  </Center>

                  <Center mx={2}>
                    <Link href="https://dzone.com/articles/cleaning-up-ai-generated-images-with-codeformer-a">
                      <Image
                        src="/img/logos/media/dZoneLogo.webp"
                        alt="dZoneLogo"
                        height="1.3em"
                        objectFit="contain"
                      />
                    </Link>
                  </Center>

                  <Center mx={2}>
                    <Link href="https://ai.plainenglish.io/a-founders-guide-to-synthesizing-sound-effects-music-and-dialog-with-audioldm-a0d0c1bb3273">
                      <Image
                        src="/img/logos/media/aiInPlainEnglishLogo.webp"
                        alt="aiInPlainEnglishLogo"
                        height="1.3em"
                        objectFit="contain"
                      />
                    </Link>
                  </Center>

                  <Center mx={2}>
                    <Link href="https://dev.to/mikeyoung44/a-plain-english-guide-to-reverse-engineering-reddits-source-code-with-langchain-activeloop-and-gpt-4-3149">
                      <Image
                        src="/img/logos/media/devToLogo.webp"
                        alt="devToLogo"
                        height="1.3em"
                        objectFit="contain"
                      />
                    </Link>
                  </Center>
                </Flex>
              </Box>
            </VStack>

            {/* Right Column */}

            <VStack align="start" spacing={6}>
              <Image
                src="/img/test.svg"
                alt="Test SVG"
                width="100%"
                objectFit="contain"
              />
              <Center textAlign="center">
                <Heading as="h2" fontSize="2xl">
                  Search 240,800+ models from 7,560+ creators on all major
                  platforms
                </Heading>
              </Center>
              <Flex wrap="wrap" alignItems="center" justifyContent="center">
                <Center height="50px" mx={1}>
                  <Image
                    src="/img/logos/platforms/cerebriumLogo.webp"
                    alt="cerebriumLogo"
                    height="1.4em"
                    objectFit="contain"
                  />
                </Center>

                <Center height="50px" mx={1}>
                  <Image
                    src="/img/logos/platforms/deepInfraLogo.webp"
                    alt="deepInfraLogo"
                    height="1.4em"
                    objectFit="contain"
                  />
                </Center>

                <Center height="50px" mx={1}>
                  <Image
                    src="/img/logos/platforms/replicateLogo.webp"
                    alt="replicateLogo"
                    height="1.4em"
                    objectFit="contain"
                  />
                </Center>

                <Center height="50px" mx={1}>
                  <Image
                    src="/img/logos/platforms/huggingFaceLogo.webp"
                    alt="huggingFaceLogo"
                    height="1.4em"
                    objectFit="contain"
                  />
                </Center>
              </Flex>
            </VStack>
          </Grid>

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
