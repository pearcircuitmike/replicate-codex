import React, { useState, useEffect, Suspense } from "react";
import { Box, Container, Heading, Text } from "@chakra-ui/react";
import MetaTags from "../components/MetaTags";
import HeroSection from "../components/homepage/HeroSection";
import StatsSection from "../components/homepage/StatsSection";
import BenefitsSection from "../components/homepage/BenefitsSection";
import Testimonials from "../components/homepage/Testimonials";
import AuthForm from "@/components/AuthForm";

// Lazy load the LandingPageTrending component
const LandingPageTrending = React.lazy(() =>
  import("../components/LandingPageTrending")
);

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [trendingData, setTrendingData] = useState({ models: [], papers: [] });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 480);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function fetchTrendingData() {
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

        setTrendingData({ papers, models });
      } catch (error) {
        console.error("Error fetching trending data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrendingData();
  }, []);

  return (
    <>
      <MetaTags
        title="Your Roadmap to the AI Revolution - AIModels.fyi"
        description="AImodels.fyi scans repos, journals, and social media to bring you the ML breakthroughs that actually matter, so you spend less time reading and more time building."
      />

      <HeroSection isMobile={isMobile} />

      <StatsSection />
      <Container my={3} align="center">
        <Heading mb={3} as="h3" size="md">
          Set your first alert!
        </Heading>
        <AuthForm isUpgradeFlow />{" "}
      </Container>

      {/*
      <Box py={16} width="100%">
        <Suspense fallback={<Box>Loading trending content...</Box>}>
          <LandingPageTrending
            trendingModels={trendingData.models}
            trendingPapers={trendingData.papers}
            isLoading={isLoading}
          />
        </Suspense>
      </Box> 

      <BenefitsSection /> */}

      <Box bg="gray.100" my={16} py={16} px={8}>
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
