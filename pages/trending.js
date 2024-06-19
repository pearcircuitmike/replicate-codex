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
import MetaTags from "../components/MetaTags";
import {
  fetchTrendingModels,
  fetchTrendingCreators,
  fetchTrendingAuthors,
  fetchTrendingPapers,
} from "../utils/fetchLandingPageData";
import LandingPageTrending from "../components/LandingPageTrending";
import AuthForm from "../components/AuthForm";

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
          <Text fontSize="xl" mb={3}>
            Explore the most popular and trending AI research, as measured by
            stars, upvotes, likes, and more.
          </Text>
          <Container maxW="container.md">
            <Center my={"45px"}>
              <AuthForm />
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
