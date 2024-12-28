// pages/papers/[platform]/[paper].js

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Container,
  Box,
  Grid,
  GridItem,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  fetchPaperDataBySlug,
  fetchPapersPaginated,
} from "@/pages/api/utils/fetchPapers";

// Dynamically import side components
const MetaTags = dynamic(() => import("@/components/MetaTags"));
const SectionsNav = dynamic(() => import("@/components/paper/SectionsNav"));
const PaperNotes = dynamic(() => import("@/components/notes/PaperNotes"), {
  ssr: false,
});
const ChatWithPaper = dynamic(
  () => import("@/components/paper/ChatWithPaper"),
  {
    ssr: false,
  }
);
const PaperContent = dynamic(() => import("@/components/paper/PaperContent"));
const AudioPlayer = dynamic(() => import("@/components/paper/AudioPlayer"), {
  ssr: false,
});

const PaperDetailsPage = ({ paper, slug, error }) => {
  const { user, hasActiveSubscription } = useAuth();

  const [viewCounts, setViewCounts] = useState({
    totalUniqueViews: 0,
    uniqueResources: [],
    canViewFullArticle: true,
  });

  // We'll fetch related papers client-side, storing them here:
  const [relatedPapers, setRelatedPapers] = useState([]);

  useEffect(() => {
    if (!paper?.embedding) return;

    // Use a POST request to avoid 431 errors (large query params)
    const fetchRelated = async () => {
      try {
        const res = await fetch("/api/utils/fetchRelatedPapers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            embedding: paper.embedding,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Request failed with status ${res.status}: ${errorText}`
          );
        }

        const data = await res.json();
        setRelatedPapers(data.papers || []);
      } catch (err) {
        console.error("Error fetching related papers:", err);
      }
    };

    fetchRelated();
  }, [paper?.embedding]);

  console.log(relatedPapers);

  // Track resource views
  useEffect(() => {
    if (!paper?.slug) return;

    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem("sessionId", sessionId);
    }

    axios
      .get(`/api/resource-view-count`, {
        params: {
          session_id: sessionId,
          resource_type: "papers",
        },
      })
      .then((response) => {
        if (!response.data) {
          throw new Error("Failed to fetch view counts");
        }
        setViewCounts(response.data);
      })
      .catch((err) => {
        console.error("Error fetching view counts:", err);
      });
  }, [paper?.slug]);

  // If error or no paper, return fallback
  if (error || !paper) {
    return (
      <Box maxW="100vw" overflowX="hidden" p={8}>
        <Heading as="h1" fontSize="1.2rem" fontWeight="bold" mb="1rem">
          Paper Temporarily Unavailable
        </Heading>
        <Text>
          We&apos;re having trouble loading <strong>{slug}</strong>. Please try
          again later.
        </Text>
      </Box>
    );
  }

  // Render normal page content
  return (
    <Box maxW="100vw" overflowX="hidden">
      <MetaTags
        title={`${paper.title} | AI Research Paper Details`}
        description={paper.abstract}
        socialPreviewImage={paper.thumbnail}
        socialPreviewTitle={paper.title}
        socialPreviewSubtitle={paper.abstract}
      />

      <Container
        maxW={{ base: "100%", xl: "8xl" }}
        px={{ base: 2, md: 4 }}
        mx="auto"
      >
        <Grid
          templateColumns={{
            base: "minmax(0, 1fr)",
            lg: "250px minmax(0, 1fr) 300px",
          }}
          gap={{ base: 4, lg: 6 }}
          minH="100vh"
        >
          {/* Left Column - Sections */}
          <GridItem display={{ base: "none", lg: "block" }} w={{ lg: "250px" }}>
            <Box
              position="sticky"
              top="0"
              maxH="100vh"
              overflowY="auto"
              overflowX="hidden"
              css={{
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: "2px",
                },
              }}
            >
              <Box py={8}>
                <SectionsNav
                  markdownContent={paper.generatedSummary}
                  paper={{
                    ...paper,
                    url: `https://aimodels.fyi/papers/arxiv/${paper.slug}`,
                  }}
                />
              </Box>
            </Box>
          </GridItem>

          {/* Middle Column - Paper Content */}
          <GridItem w="100%" maxW="100%">
            <Box
              id="main-content"
              maxH={{ base: "none", lg: "100vh" }}
              overflowY={{ base: "visible", lg: "auto" }}
              overflowX="hidden"
              position="relative"
              css={{
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              <Box py={4} pb={{ base: 32, lg: 24 }} px={{ base: 2, md: 4 }}>
                <PaperContent
                  paper={{
                    ...paper,
                    tasks: paper.tasks || [],
                  }}
                  hasActiveSubscription={hasActiveSubscription}
                  viewCounts={viewCounts}
                />
              </Box>
            </Box>
          </GridItem>

          {/* Right Column - Audio & Notes */}
          <GridItem display={{ base: "none", lg: "block" }} w={{ lg: "300px" }}>
            <Box
              position="sticky"
              top="0"
              height="100vh"
              overflowY="auto"
              overflowX="hidden"
              css={{
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: "2px",
                },
              }}
            >
              <Flex flexDirection="column" height="100%" position="relative">
                <Box py={8}>
                  <Box mb={6}>
                    <Box fontSize="lg" fontWeight="semibold" mb={4}>
                      Listen to this paper
                    </Box>
                    {paper.generatedSummary && (
                      <AudioPlayer text={paper.generatedSummary} />
                    )}
                  </Box>
                  <Box mt={6}>
                    <PaperNotes paperId={paper.id} />
                  </Box>
                </Box>
                <ChatWithPaper
                  paperId={paper.id}
                  paper={{
                    abstract: paper.abstract,
                    generatedSummary: paper.generatedSummary,
                  }}
                />
              </Flex>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export async function getStaticPaths() {
  const platforms = ["arxiv"];
  const paths = [];
  const pageSize = 1000;
  const limit = 100;

  for (const platform of platforms) {
    let currentPage = 1;
    let totalFetched = 0;

    while (totalFetched < limit) {
      const { data: papers } = await fetchPapersPaginated({
        platform,
        pageSize,
        currentPage,
      });

      for (const p of papers) {
        paths.push({
          params: { paper: p.slug.toString(), platform },
        });
      }

      totalFetched += papers.length;
      if (papers.length < pageSize || totalFetched >= limit) break;
      currentPage += 1;
    }
  }

  return { paths, fallback: true };
}

export async function getStaticProps({ params }) {
  const { platform, paper: slug } = params;
  let paper = null;
  let error = false;

  try {
    paper = await fetchPaperDataBySlug(slug, platform);
  } catch (err) {
    console.error("Error fetching paper data:", err);
    error = true;
  }

  if (!paper || !paper.abstract || !paper.generatedSummary) {
    return {
      props: {
        error: true,
        slug,
      },
      revalidate: 60,
    };
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const lastUpdatedDate = new Date(paper.lastUpdated);

  return {
    props: {
      paper: {
        ...paper,
        tasks: paper.tasks || [],
      },
      slug,
      error: false,
    },
    revalidate: lastUpdatedDate <= oneWeekAgo ? false : 3600 * 24,
  };
}

export default PaperDetailsPage;
