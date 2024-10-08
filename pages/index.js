import React, { useEffect, useState, lazy, Suspense, useRef } from "react";
import {
  useMediaQuery,
  Stat,
  StatLabel,
  StatNumber,
  Container,
  VStack,
  Heading,
  Text,
  Box,
  Flex,
  Icon,
  Button,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import MetaTags from "../components/MetaTags";
import Testimonials from "../components/Testimonials";
import Link from "next/link"; // Import the Link component from Next.js

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

// Counter component to handle the counting effect with commas
const Counter = ({ start, end }) => {
  const [count, setCount] = useState(start);
  const ref = useRef();

  useEffect(() => {
    let observer;
    let started = false;

    const countUp = () => {
      const startTime = performance.now();
      const duration = 2000; // 2 seconds

      const step = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const currentCount = Math.floor(progress * (end - start) + start);

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    };

    const handleIntersection = (entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        countUp();
      }
    };

    observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.5, // Trigger when 50% of the element is visible
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [end, start]);

  return (
    <StatNumber ref={ref} fontSize="4xl" color="red.500">
      {count.toLocaleString()}
    </StatNumber>
  );
};

export default function Home() {
  const [isMobile] = useMediaQuery("(max-width: 480px)");
  const [trendingData, setTrendingData] = useState({
    models: [],
    papers: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const startDate = getStartOfWeek(new Date()).toISOString();

      try {
        const [papersRes, modelsRes] = await Promise.all([
          fetch(
            `/api/trending/papers?platform=arxiv&startDate=${startDate}&limit=8`
          ),
          fetch(`/api/trending/models?startDate=${startDate}&limit=8`),
        ]);

        if (!papersRes.ok || !modelsRes.ok) {
          throw new Error("Failed to fetch one or more trending data");
        }

        const [papers, models] = await Promise.all([
          papersRes.json(),
          modelsRes.json(),
        ]);

        setTrendingData({
          papers,
          models,
        });
      } catch (error) {
        console.error("Error fetching trending data:", error);
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
        </main>
      </Container>

      {/* Full-width trending section with lazy loading */}
      <Box py={16} px={0} width="100%">
        <Suspense fallback={<div>Loading trending content...</div>}>
          <LandingPageTrending
            trendingModels={trendingData.models}
            trendingPapers={trendingData.papers}
            isLoading={isLoading}
          />
        </Suspense>
      </Box>

      {/* How it works */}
      <main>
        <Box bg="gray.100" py={16} px={8} width="100%">
          <Container maxW="8xl">
            <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
              How it works
            </Heading>
            <Flex direction="column" gap={8}>
              {/* Discover AI breakthroughs */}
              <Flex
                justifyContent="space-between"
                alignItems="center"
                px={6}
                py="40px"
                bg="white"
                borderRadius="md"
                boxShadow="md"
              >
                <Box>
                  <Heading as="h3" fontSize="2xl" mb={4}>
                    Discover AI breakthroughs
                  </Heading>
                  <Text fontSize="lg">
                    Our listening algorithm identifies the AI developments with
                    the biggest impact.
                  </Text>
                </Box>
                <Box textAlign="right">
                  <Stat>
                    <Counter start={0} end={3485} />
                    <StatLabel>Papers and models released this week</StatLabel>
                  </Stat>
                </Box>
              </Flex>

              {/* Skim summaries of each discovery */}
              <Flex
                justifyContent="space-between"
                alignItems="center"
                px={6}
                py="40px"
                bg="white"
                borderRadius="md"
                boxShadow="md"
              >
                <Box>
                  <Heading as="h3" fontSize="2xl" mb={4}>
                    Skim summaries of each discovery
                  </Heading>
                  <Text fontSize="lg">
                    We translate models and papers into short, clear guides.
                  </Text>
                </Box>
                <Box textAlign="right">
                  <Stat>
                    <Counter start={0} end={3283} />
                    <StatLabel>Summaries created</StatLabel>
                  </Stat>
                </Box>
              </Flex>

              {/* Meet helpful experts and friends */}
              <Flex
                justifyContent="space-between"
                alignItems="center"
                px={6}
                py="40px"
                bg="white"
                borderRadius="md"
                boxShadow="md"
              >
                <Box>
                  <Heading as="h3" fontSize="2xl" mb={4}>
                    Meet helpful experts and friends
                  </Heading>
                  <Text fontSize="lg">
                    Join the Discord to chat with the creators and builders
                    behind the breakthroughs.
                  </Text>
                </Box>
                <Box textAlign="right">
                  <Stat>
                    <Counter start={0} end={2117} />
                    <StatLabel>
                      Users read 1,817 summaries <b>today</b>
                    </StatLabel>
                  </Stat>
                </Box>
              </Flex>

              {/* Subscription section with special formatting */}
              <Flex
                justifyContent="space-between"
                alignItems="center"
                px={6}
                py="40px"
                bgGradient="linear(to-r, yellow.400, yellow.300)"
                borderRadius="md"
                boxShadow="md"
              >
                <Box>
                  <Heading as="h3" fontSize="2xl" mb={4} color="black">
                    Subscribe now for personalized insights
                  </Heading>
                  <Text fontSize="lg" color="black">
                    Get exclusive access to our AI community and more!
                  </Text>
                </Box>
                <Box textAlign="right">
                  <Stat>
                    <Counter start={0} end={312} />
                    <StatLabel color="black">
                      Other people subscribed today
                    </StatLabel>
                  </Stat>
                </Box>
              </Flex>

              {/* Add the 'Subscribe Now' button */}
              <Flex justifyContent="center" mt={8}>
                <Link href="/login" passHref>
                  <Button colorScheme="teal" size="lg">
                    Subscribe Now
                  </Button>
                </Link>
              </Flex>
            </Flex>
          </Container>
        </Box>

        <Box py={16} px={8}>
          <Container maxW="2xl">
            <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
              A subscription gets you...
            </Heading>
            <Box>
              <Box px={8}>
                <Flex alignItems="center" mb={4}>
                  <Icon as={CheckCircleIcon} color="green.500" mr={2} />
                  <Text fontSize="xl">
                    Read unlimited summaries (free users can only read 5)
                  </Text>
                </Flex>
                <Flex alignItems="center" mb={4}>
                  <Icon as={CheckCircleIcon} color="green.500" mr={2} />
                  <Text fontSize="xl">See trending topics in publications</Text>
                </Flex>
                <Flex alignItems="center" mb={4}>
                  <Icon as={CheckCircleIcon} color="green.500" mr={2} />
                  <Text fontSize="xl">
                    See what's popular with other researchers
                  </Text>
                </Flex>
                <Flex alignItems="center" mb={4}>
                  <Icon as={CheckCircleIcon} color="green.500" mr={2} />
                  <Text fontSize="xl">
                    Bookmark resources for easy reference
                  </Text>
                </Flex>
                <Flex alignItems="center" mb={4}>
                  <Icon as={CheckCircleIcon} color="green.500" mr={2} />
                  <Text fontSize="xl">Join 200+ Discord community members</Text>
                </Flex>
                <Flex alignItems="center">
                  <Icon as={CheckCircleIcon} color="green.500" mr={2} />
                  <Text fontSize="xl">
                    Get weekly digests of top models and papers
                  </Text>
                </Flex>
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
      </main>
    </>
  );
}
