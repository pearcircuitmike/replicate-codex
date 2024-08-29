import React, { useEffect, useState, lazy, Suspense } from "react";
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
import AuthForm from "../components/AuthForm";
import Testimonials from "../components/Testimonials";

import {
  fetchTrendingPapers,
  fetchTrendingModels,
  fetchTrendingCreators,
  fetchTrendingAuthors,
} from "./api/utils/fetchLandingPageData.js";

// Lazy load the LandingPageTrending component
const LandingPageTrending = lazy(() =>
  import("../components/LandingPageTrending")
);

const getStartOfWeek = (date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  return startOfWeek;
};

export default function Home() {
  const [isMobile] = useMediaQuery("(max-width: 480px)");
  const [trendingData, setTrendingData] = useState({
    models: [],
    papers: [],
    creators: [],
    authors: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const startDate = getStartOfWeek(new Date());

      fetchTrendingPapers("arxiv", startDate, 4).then((papers) => {
        setTrendingData((prevData) => ({ ...prevData, papers }));
      });

      fetchTrendingModels(startDate, 4).then((models) => {
        setTrendingData((prevData) => ({ ...prevData, models }));
      });

      fetchTrendingCreators(startDate, 4).then((creators) => {
        setTrendingData((prevData) => ({ ...prevData, creators }));
      });

      fetchTrendingAuthors(4).then((authors) => {
        setTrendingData((prevData) => ({ ...prevData, authors }));
      });

      setIsLoading(false);
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
          <VStack spacing={8} mb={8}>
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
          <Center>
            <AuthForm />
          </Center>
        </main>
      </Container>
      {/* Full-width trending section with lazy loading */}
      <Box py={16} px={0} width="100%">
        <Suspense fallback={<div>Loading trending content...</div>}>
          <LandingPageTrending
            trendingModels={trendingData.models}
            trendingPapers={trendingData.papers}
            trendingCreators={trendingData.creators}
            trendingAuthors={trendingData.authors}
            isLoading={isLoading}
          />
        </Suspense>
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
            <Testimonials />
          </Container>
        </Box>

        <Box py={16} px={8}>
          <Container maxW="12xl">
            <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
              Create account for full access
            </Heading>
            <Center mb={"80px"}>
              <AuthForm />
            </Center>
          </Container>
        </Box>
      </main>
    </>
  );
}
