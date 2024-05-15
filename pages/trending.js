"use client";

import { useRouter } from "next/router";
import {
  Box,
  Heading,
  Text,
  Container,
  VStack,
  HStack,
  Spacer,
  Button,
  Center,
} from "@chakra-ui/react";
import { useEffect } from "react";
import MetaTags from "../components/MetaTags";
import {
  fetchTrendingModels,
  fetchTrendingCreators,
  fetchTrendingAuthors,
  fetchTrendingPapers,
} from "../utils/fetchLandingPageData";
import LandingPageTrending from "../components/LandingPageTrending";

const getStartOfWeek = (date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  return startOfWeek;
};

export default function Trending({
  trendingPapers,
  trendingModels,
  trendingCreators,
  trendingAuthors,
  startDate,
}) {
  const router = useRouter();

  const handlePrevWeek = () => {
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - 7);
    router.push(`/trending?startDate=${prevStartDate.toISOString()}`);
  };

  const handleNextWeek = () => {
    const nextStartDate = new Date(startDate);
    nextStartDate.setDate(nextStartDate.getDate() + 7);
    const currentDate = getStartOfWeek(new Date());
    if (nextStartDate <= currentDate) {
      router.push(`/trending?startDate=${nextStartDate.toISOString()}`);
    }
  };

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
        redirect: "/thank-you?source=trending"
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

  return (
    <>
      <MetaTags
        title="Trending Research | AIModels.fyi"
        description="Discover the top trending AI research papers."
        socialPreviewImage={`${process.env.NEXT_PUBLIC_SITE_BASE_URL}/img/ogImg/ogImg_trending.png`}
        socialPreviewTitle="Trending Research"
        socialPreviewSubtitle="The top AI and ML research papers of the week!"
      />
      <Container maxW="4xl">
        <Box as="main" p={6}>
          <Heading as="h1" size="xl" mb={4}>
            Trending Research
          </Heading>
          <Text fontSize="xl" mb={8}>
            Explore the most popular and trending AI research, as measured by
            stars, upvotes, likes, and more.
          </Text>
          <Container maxW="container.md">
            <Box mt={8}>
              <Text fontWeight="bold" fontSize="lg" mb={4} align="center">
                Get summaries of the top AI research delivered straight to your
                inbox:
              </Text>
            </Box>

            <Center my={"45px"}>
              <div id="custom-substack-embed"></div>
            </Center>
          </Container>

          <Text mb={4}>
            Week: {new Date(startDate).toLocaleDateString()} -{" "}
            {new Date(
              new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000
            ).toLocaleDateString()}
          </Text>

          <HStack my={8}>
            <Button onClick={handlePrevWeek}>Previous Week</Button>
            <Spacer />
            <Button
              onClick={handleNextWeek}
              isDisabled={
                new Date(
                  new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000
                ) > getStartOfWeek(new Date())
              }
            >
              Next Week
            </Button>
          </HStack>
        </Box>
      </Container>
      <Box py={16} px={0} width="100%">
        <LandingPageTrending
          trendingModels={trendingModels}
          trendingPapers={trendingPapers}
          trendingCreators={trendingCreators}
          trendingAuthors={trendingAuthors}
          isLoading={false}
        />
      </Box>
    </>
  );
}

export async function getServerSideProps(context) {
  const { startDate: startDateQuery } = context.query;
  const startDate = startDateQuery
    ? new Date(startDateQuery)
    : getStartOfWeek(new Date());
  const trendingPapers = await fetchTrendingPapers("arxiv", startDate);
  const trendingModels = await fetchTrendingModels(startDate);
  const trendingCreators = await fetchTrendingCreators(startDate);
  const trendingAuthors = await fetchTrendingAuthors("arxiv", startDate);
  return {
    props: {
      trendingPapers,
      trendingModels,
      trendingCreators,
      trendingAuthors,
      startDate: startDate.toISOString(),
    },
  };
}
