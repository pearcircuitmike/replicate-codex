import React, { useState, useEffect } from "react";
import { Container, Box, Grid, GridItem, Flex } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  fetchPaperDataBySlug,
  fetchPapersPaginated,
} from "@/pages/api/utils/fetchPapers";
import fetchRelatedPapers from "@/pages/api/utils/fetchRelatedPapers";

import MetaTags from "@/components/MetaTags";
import SectionsNav from "@/components/paper/SectionsNav";
import PaperNotes from "@/components/notes/PaperNotes";
import ChatWithPaper from "@/components/paper/ChatWithPaper";
import PaperContent from "@/components/paper/PaperContent";
import AudioPlayer from "@/components/paper/AudioPlayer";

const PaperDetailsPage = ({ paper, relatedPapers, slug }) => {
  const { user, hasActiveSubscription } = useAuth();
  const [viewCounts, setViewCounts] = useState({
    totalUniqueViews: 0,
    uniqueResources: [],
    canViewFullArticle: true,
  });

  useEffect(() => {
    const fetchViewCounts = async () => {
      if (!paper?.slug) return;

      let sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem("sessionId", sessionId);
      }

      try {
        const response = await axios.get(`/api/resource-view-count`, {
          params: {
            session_id: sessionId,
            resource_type: "papers",
          },
        });

        if (!response.data) throw new Error("Failed to fetch view counts");
        setViewCounts(response.data);
      } catch (error) {
        console.error("Error fetching view counts:", error);
      }
    };

    fetchViewCounts();
  }, [paper?.slug]);

  if (!paper || !paper.abstract || !paper.generatedSummary) {
    return null;
  }

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
            base: "minmax(0, 1fr)", // This is what was missing - mobile needs minmax too
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
                    url: `https://aimodels.fyi/papers/arxiv/${paper.slug}`, // Pass the correct URL directly
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
                    tasks: paper.tasks || [], // Ensure tasks are passed
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
      const { data: papers, totalCount } = await fetchPapersPaginated({
        platform: `${platform}`,
        pageSize,
        currentPage,
      });

      for (const paper of papers) {
        paths.push({
          params: { paper: paper.slug.toString(), platform },
        });
      }

      totalFetched += papers.length;
      if (papers.length < pageSize || totalFetched >= limit) break;
      currentPage += 1;
    }
  }

  return { paths, fallback: "true" };
}

export async function getStaticProps({ params }) {
  const { platform, paper: slug } = params;
  const paper = await fetchPaperDataBySlug(slug, platform);

  if (!paper || !paper.abstract || !paper.generatedSummary) {
    return { notFound: true };
  }

  // Ensure tasks are included in the paper object
  const paperWithTasks = {
    ...paper,
    tasks: paper.tasks || [], // Provide a default empty array if tasks don't exist
  };

  let relatedPapers = [];
  if (paper.embedding) {
    relatedPapers = await fetchRelatedPapers(paper.embedding);
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const lastUpdatedDate = new Date(paper.lastUpdated);

  return {
    props: {
      paper: paperWithTasks,
      relatedPapers,
      slug,
    },
    revalidate: lastUpdatedDate <= oneWeekAgo ? false : 3600 * 24,
  };
}

export default PaperDetailsPage;
