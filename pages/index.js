import React, { useState, useEffect, Suspense } from "react";
import { Box, Container, Heading, Text } from "@chakra-ui/react";
import MetaTags from "../components/MetaTags";
import HeroSection from "../components/Homepage1/HeroSection";
import StatsSection from "../components/Homepage1/StatsSection";
import Testimonials from "../components/Homepage1/Testimonials";
import AuthForm from "@/components/AuthForm";

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
        canonicalUrl="https://www.aimodels.fyi/"
      />

      <HeroSection isMobile={isMobile} />

      <StatsSection />
      <Container my={3} align="center">
        <Heading mb={3} as="h3" size="md">
          Set your first alert!
        </Heading>
        <AuthForm isUpgradeFlow />{" "}
      </Container>

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
