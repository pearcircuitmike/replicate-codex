import React, { useEffect, useState, lazy, Suspense } from "react";
import { useMediaQuery } from "@chakra-ui/react";
import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  Center,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import MetaTags from "../components/MetaTags.js";
import AuthForm from "../components/AuthForm";
import Testimonials from "../components/Testimonials";

// Lazy load the LandingPageTrending component
const LandingPageTrending = lazy(() =>
  import("../components/LandingPageTrending")
);

// Function to get the start of the current week (Sunday)
const getStartOfWeek = (date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  startOfWeek.setHours(0, 0, 0, 0); // Reset time to midnight
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
      const startDate = getStartOfWeek(new Date()).toISOString();

      try {
        // Fetch all data in parallel
        const [papersRes, modelsRes, creatorsRes, authorsRes] =
          await Promise.all([
            fetch(
              `/api/trending/papers?platform=arxiv&startDate=${startDate}&limit=4`
            ),
            fetch(`/api/trending/models?startDate=${startDate}&limit=4`),
            fetch(`/api/trending/creators?limit=4`),
            fetch(`/api/trending/authors?limit=4`),
          ]);

        if (
          !papersRes.ok ||
          !modelsRes.ok ||
          !creatorsRes.ok ||
          !authorsRes.ok
        ) {
          throw new Error("Failed to fetch one or more trending data");
        }

        const [papers, models, creators, authors] = await Promise.all([
          papersRes.json(),
          modelsRes.json(),
          creatorsRes.json(),
          authorsRes.json(),
        ]);

        setTrendingData({
          papers,
          models,
          creators,
          authors,
        });
      } catch (error) {
        console.error("Error fetching trending data:", error);
        // Optionally, set error state here to display an error message to users
      } finally {
        setIsLoading(false);
      }
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
            <Box>
              <Box
                px={6}
                py={"40px"}
                bg="white"
                borderRadius="md"
                boxShadow="md"
                mb={8}
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
                mb={8}
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
            </Box>
          </Container>
        </Box>

        <Box py={16} px={8}>
          <Container maxW="4xl">
            <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
              A subscription gets you...
            </Heading>
            <Box>
              <Box spacing={4}>
                <Box display="flex" alignItems="center" mb={4}>
                  <Box as={CheckCircleIcon} color="green.500" mr={2} />
                  <Text fontSize="xl">
                    The most impactful AI content, personalized to your
                    interests and delivered to your inbox
                  </Text>
                </Box>
                <Box display="flex" alignItems="center" mb={4}>
                  <Box as={CheckCircleIcon} color="green.500" mr={2} />
                  <Text fontSize="xl">
                    Guides to the top models, papers and tools - no PhD
                    required!
                  </Text>
                </Box>
                <Box display="flex" alignItems="center">
                  <Box as={CheckCircleIcon} color="green.500" mr={2} />
                  <Text fontSize="xl">
                    Exclusive access to the Discord community with AI experts
                    and builders
                  </Text>
                </Box>
              </Box>
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
