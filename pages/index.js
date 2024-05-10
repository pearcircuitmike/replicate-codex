import React, { useEffect, useState } from "react";
import { useMediaQuery } from "@chakra-ui/react";
import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  SimpleGrid,
  Stack,
  Icon,
  Center,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";

import MetaTags from "../components/MetaTags.js";
import LandingPageTrending from "../components/LandingPageTrending";

import {
  fetchTrendingModels,
  fetchTrendingPapers,
  fetchTrendingCreators,
  fetchTrendingAuthors,
} from "../utils/fetchLandingPageData";

export default function Home() {
  const [isMobile] = useMediaQuery("(max-width: 480px)");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://substackcdn.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    const customScript = document.createElement("script");
    customScript.innerHTML = `
      window.CustomSubstackWidget = {
        substackUrl: "aimodels.substack.com",
        placeholder: "example@gmail.com",
        buttonText: "Try it for free!",
        theme: "custom",
        colors: {
          primary: "#319795",
          input: "white",
          email: "#1A202C",
          text: "white",
        },
      };
    `;
    document.body.appendChild(customScript);

    const widgetScript = document.createElement("script");
    widgetScript.src = "https://substackapi.com/widget.js";
    widgetScript.async = true;
    document.body.appendChild(widgetScript);

    return () => {
      document.body.removeChild(script);
      document.body.removeChild(customScript);
      document.body.removeChild(widgetScript);
    };
  }, []);

  const [trendingModels, setTrendingModels] = useState([]);
  const [trendingPapers, setTrendingPapers] = useState([]);
  const [trendingCreators, setTrendingCreators] = useState([]);
  const [trendingAuthors, setTrendingAuthors] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const models = await fetchTrendingModels(4);
      const papers = await fetchTrendingPapers("arxiv", 4);
      const creators = await fetchTrendingCreators(4);
      const authors = await fetchTrendingAuthors("arxiv", 4);

      setTrendingModels(models);
      setTrendingPapers(papers);
      setTrendingCreators(creators);
      setTrendingAuthors(authors);
    }

    fetchData();
  }, []);

  return (
    <>
      <MetaTags
        title={"Your Roadmap to the AI Revolution - AIModels.fyi"}
        description={
          "AImodels.fyi scans repos, journals, and social media to bring you the ML breakthroughs that actually matter, so you spend less time reading and more time building."
        }
      />
      <Container maxW="5xl" mt={isMobile ? "50px" : "100px"} textAlign="center">
        <main>
          <VStack spacing={8} mb={16}>
            <Heading
              as="h1"
              fontSize={isMobile ? "3xl" : "4xl"}
              fontWeight="bold"
            >
              Find the AI breakthroughs that{" "}
              <Text
                bgGradient="linear(to-tr, #3182CE,#38A169)"
                bgClip="text"
                fontWeight="extrabold"
                display="inline"
              >
                actually
              </Text>{" "}
              matter
            </Heading>
            <Text fontSize={isMobile ? "md" : "lg"} color={"gray.600"}>
              Devs release thousands of AI papers, models, and tools daily. Only
              a few will be revolutionary. We scan repos, journals, and social
              media to bring them to you in bite-sized recaps.
            </Text>
          </VStack>

          <Heading as="h2" fontSize="lg" mb={3} textAlign="center">
            Get daily guides to trending AI tech...
          </Heading>
          <Center mb={"80px"}>
            <div id="custom-substack-embed"></div>
          </Center>
        </main>
      </Container>
      {/* Full-width trending section */}
      <Box py={16} px={0} width="100%">
        <LandingPageTrending
          trendingModels={trendingModels}
          trendingPapers={trendingPapers}
          trendingCreators={trendingCreators}
          trendingAuthors={trendingAuthors}
        />
      </Box>
      <main>
        <Box bg="gray.100" py={16} px={8} width="100%">
          <Container maxW="8xl">
            <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
              How it works
            </Heading>
            <SimpleGrid columns={[1, 1, 3]} spacing={8}>
              <Box
                px={6}
                py={"40px"}
                bg="white"
                borderRadius="md"
                boxShadow="md"
              >
                <Heading as="h3" fontSize="2xl" mb={4}>
                  Discover AI breakthroughs
                </Heading>
                <Text fontSize="lg">
                  Our listening algorithm identifies the AI developments with
                  the biggest impact
                </Text>
              </Box>
              <Box
                px={6}
                py={"40px"}
                bg="white"
                borderRadius="md"
                boxShadow="md"
              >
                <Heading as="h3" fontSize="2xl" mb={4}>
                  Skim summaries of each discovery
                </Heading>
                <Text fontSize="lg">
                  We translate models and papers into short, clear guides for
                  rapid absorption.
                </Text>
              </Box>
              <Box
                px={6}
                py={"40px"}
                bg="white"
                borderRadius="md"
                boxShadow="md"
              >
                <Heading as="h3" fontSize="2xl" mb={4}>
                  Meet helpful experts and friends
                </Heading>
                <Text fontSize="lg">
                  Join the Discord to chat with the creators and builders behind
                  the breakthroughs.
                </Text>
              </Box>
            </SimpleGrid>
          </Container>
        </Box>

        <Box py={16} px={8}>
          <Container maxW="4xl">
            <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
              A subscription gets you...
            </Heading>
            <Box>
              <Stack spacing={4}>
                <Box display="flex" alignItems="center">
                  <Icon as={CheckCircleIcon} color="green.500" mr={2} />
                  <Text fontSize="xl">
                    The most impactful AI content, personalized to your
                    interests and delivered to your inbox
                  </Text>
                </Box>
                <Box display="flex" alignItems="center">
                  <Icon as={CheckCircleIcon} color="green.500" mr={2} />
                  <Text fontSize="xl">
                    Guides to the top models, papers and tools - no PhD
                    required!
                  </Text>
                </Box>
                <Box display="flex" alignItems="center">
                  <Icon as={CheckCircleIcon} color="green.500" mr={2} />
                  <Text fontSize="xl">
                    Exclusive access to the Discord community with AI experts
                    and builders
                  </Text>
                </Box>
              </Stack>
            </Box>
          </Container>
        </Box>

        <Box bg="gray.100" py={16} px={8}>
          <Container maxW="8xl">
            <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
              What our users say
            </Heading>
            <SimpleGrid columns={[1, 2]} spacing={8}>
              <Box
                bg="white"
                borderRadius="md"
                boxShadow="md"
                overflow="hidden"
              >
                <Box p={6}>
                  <Text fontSize="xl" mb={4}>
                    &quot;AImodels.fyi&apos;s summaries are my cheat code.
                    They&apos;ve helped me rapidly parse my options based on new
                    research and then and implement them in my code.&quot;
                  </Text>
                  <Box display="flex" alignItems="center">
                    <Box
                      borderRadius="full"
                      width="48px"
                      height="48px"
                      overflow="hidden"
                      mr={4}
                    >
                      <img
                        src="https://media.licdn.com/dms/image/C5603AQFhkTZjZxF6cQ/profile-displayphoto-shrink_100_100/0/1627310111771?e=1720656000&v=beta&t=b-b_lq8TiGtu29b5XVBB2Ohj3GtYIETUylajANz9rFg"
                        alt="Philip"
                      />
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Philip P.</Text>
                      <Text fontSize="sm" color="gray.500">
                        AI Founder
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box
                bg="white"
                borderRadius="md"
                boxShadow="md"
                overflow="hidden"
              >
                <Box p={6}>
                  <Text fontSize="xl" mb={4}>
                    &quot;The expert discussions in the Discord have been a
                    goldmine. Collaborating with other AI fanatics has
                    turbocharged my growth and opened up new
                    opportunities.&quot;
                  </Text>
                  <Box display="flex" alignItems="center">
                    <Box
                      borderRadius="full"
                      width="48px"
                      height="48px"
                      overflow="hidden"
                      mr={4}
                    >
                      <img
                        src="https://pbs.twimg.com/profile_images/1967113482/Ink-meNEWa_400x400.png"
                        alt="Andy"
                      />
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Andy M.</Text>
                      <Text fontSize="sm" color="gray.500">
                        AI Founder
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </SimpleGrid>
          </Container>
        </Box>

        <Box py={16} px={8}>
          <Container maxW="12xl">
            <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
              Get today&apos;s guide for free
            </Heading>
            <Center>
              <Box>
                <div id="custom-substack-embed"></div>
              </Box>
            </Center>
          </Container>
        </Box>
      </main>
    </>
  );
}
