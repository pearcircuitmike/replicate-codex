import React, { useEffect, useState, useRef } from "react";
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
import Link from "next/link";

// Counter component to handle the animated counting effect
const Counter = React.memo(({ start, end }) => {
  const [count, setCount] = useState(start);
  const countRef = useRef();
  const animationRef = useRef();
  const startTimeRef = useRef();

  useEffect(() => {
    const animate = (currentTime) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsedTime = currentTime - startTimeRef.current;
      const duration = 2000;
      const progress = Math.min(elapsedTime / duration, 1);
      const currentCount = Math.floor(progress * (end - start) + start);

      setCount(currentCount);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    const startAnimation = () => {
      startTimeRef.current = null;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation();
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      observer?.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [end, start]);

  return (
    <StatNumber ref={countRef} fontSize="4xl" color="red.500">
      {count.toLocaleString()}
    </StatNumber>
  );
});

Counter.displayName = "Counter";

const StatBox = ({ title, text, stat, label }) => {
  const [isMobile] = useMediaQuery("(max-width: 480px)");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats/get-overall-stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Flex
      direction={isMobile ? "column" : "row"}
      justifyContent="space-between"
      alignItems="center"
      px={6}
      py="40px"
      bg="white"
      borderRadius="md"
      boxShadow="md"
    >
      <Box mb={isMobile ? 4 : 0}>
        <Heading as="h3" fontSize={isMobile ? "xl" : "2xl"} mb={4}>
          {title}
        </Heading>
        <Text fontSize={isMobile ? "md" : "lg"}>{text}</Text>
      </Box>
      <Box textAlign={isMobile ? "center" : "right"}>
        <Stat>
          {stats && <Counter start={0} end={stats[stat]} />}
          <StatLabel>{label}</StatLabel>
        </Stat>
      </Box>
    </Flex>
  );
};

export default function Home() {
  const [isMobile] = useMediaQuery("(max-width: 480px)");
  const [trendingData, setTrendingData] = useState({
    models: [],
    papers: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats/get-overall-stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const startDate = new Date();
      startDate.setUTCHours(0, 0, 0, 0);
      const startDateString = startDate.toISOString();

      try {
        const [papersRes, modelsRes] = await Promise.all([
          fetch(
            `/api/trending/papers?platform=arxiv&startDate=${startDateString}&limit=8`
          ),
          fetch(`/api/trending/models?startDate=${startDateString}&limit=8`),
        ]);

        if (!papersRes.ok || !modelsRes.ok) {
          throw new Error("Failed to fetch trending data");
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
        title="Your Roadmap to the AI Revolution - AIModels.fyi"
        description="AImodels.fyi scans repos, journals, and social media to bring you the ML breakthroughs that actually matter, so you spend less time reading and more time building."
      />
      <Container maxW="5xl" mt={isMobile ? "50px" : "100px"} textAlign="center">
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
          <Text fontSize={isMobile ? "md" : "lg"} color="gray.600">
            Thousands of AI papers, models, and tools are released daily. We
            scan repos, journals, and social media to bring you the ones that
            matter.
          </Text>
        </VStack>
      </Container>

      <Box bg="gray.100" py={16} px={8} width="100%">
        <Container maxW="8xl">
          <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
            How it works
          </Heading>
          <Flex direction="column" gap={8}>
            <StatBox
              title="Discover AI breakthroughs"
              text="Our listening algorithm identifies the AI developments with the biggest impact."
              stat="weeklyPapersCount"
              label="Papers and models released this week"
            />

            <StatBox
              title="Skim summaries of each discovery"
              text="We translate models and papers into short, clear guides."
              stat="weeklySummariesCount"
              label="Summaries created this week"
            />

            <StatBox
              title="Meet helpful experts and friends"
              text="Join the Discord to chat with the creators and builders behind the breakthroughs."
              stat="weeklySignups"
              label="New ML researchers this week"
            />

            <Flex
              direction={isMobile ? "column" : "row"}
              justifyContent="space-between"
              alignItems="center"
              px={6}
              py="40px"
              bgGradient="linear(to-r, yellow.400, yellow.300)"
              borderRadius="md"
              boxShadow="md"
            >
              <Box mb={isMobile ? 4 : 0}>
                <Heading
                  as="h3"
                  fontSize={isMobile ? "xl" : "2xl"}
                  mb={4}
                  color="black"
                >
                  Subscribe now for personalized insights
                </Heading>
                <Text fontSize={isMobile ? "md" : "lg"} color="black">
                  Get exclusive access to our AI community and more!
                </Text>
              </Box>
              <Box textAlign={isMobile ? "center" : "right"}>
                <Stat>
                  {stats && <Counter start={0} end={stats.uniquePapersCount} />}
                  <StatLabel>Unique papers across top tasks</StatLabel>
                </Stat>
              </Box>
            </Flex>

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
              <Text fontSize="xl">Bookmark resources for easy reference</Text>
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
    </>
  );
}
