// pages/papers/[platform]/[paper].js
import React, { useState, useEffect } from "react";
import { Container, Box, Grid, GridItem } from "@chakra-ui/react";
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
    return null; // Or some error component
  }

  return (
    <>
      <MetaTags
        title={`${paper.title} | AI Research Paper Details`}
        description={paper.abstract}
        socialPreviewImage={paper.thumbnail}
        socialPreviewTitle={paper.title}
        socialPreviewSubtitle={paper.abstract}
      />

      <Container maxW="8xl" px={4} position="relative">
        <Grid
          templateColumns={{
            base: "1fr",
            lg: "250px minmax(0, 1fr) 300px",
          }}
          gap={6}
          minH="100vh"
        >
          {/* Left Column - Sections */}
          <GridItem>
            <Box position="sticky" top="0" h="100vh">
              <Box py={8}>
                <SectionsNav
                  markdownContent={paper.generatedSummary}
                  paper={paper}
                />
              </Box>
            </Box>
          </GridItem>

          {/* Middle Column - Paper Content */}
          <GridItem>
            <Box
              id="main-content"
              h="100vh"
              overflowY="auto"
              css={{
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                scrollbarWidth: "none",
                "-ms-overflow-style": "none",
              }}
            >
              <Box py={8} pb={24}>
                <PaperContent
                  paper={paper}
                  hasActiveSubscription={hasActiveSubscription}
                  viewCounts={viewCounts}
                />
              </Box>
            </Box>
          </GridItem>

          {/* Right Column - Audio & Notes */}
          <GridItem>
            <Box position="sticky" top="0" h="100vh">
              <Box py={8}>
                <Box mb={6}>
                  <Box fontSize="lg" fontWeight="semibold" mb={4}>
                    Audio Overview
                  </Box>
                  {paper.generatedSummary && (
                    <AudioPlayer text={paper.generatedSummary} />
                  )}
                </Box>
                <Box mt={6}>
                  <PaperNotes paperId={paper.id} />
                </Box>
              </Box>
            </Box>
          </GridItem>
        </Grid>

        <ChatWithPaper
          paperId={paper.id}
          paper={{
            abstract: paper.abstract,
            generatedSummary: paper.generatedSummary,
          }}
        />
      </Container>
    </>
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

  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { platform, paper: slug } = params;
  const paper = await fetchPaperDataBySlug(slug, platform);

  if (!paper || !paper.abstract || !paper.generatedSummary) {
    return { notFound: true };
  }

  let relatedPapers = [];
  if (paper.embedding) {
    relatedPapers = await fetchRelatedPapers(paper.embedding);
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const lastUpdatedDate = new Date(paper.lastUpdated);

  return {
    props: { paper, relatedPapers, slug },
    revalidate: lastUpdatedDate <= oneWeekAgo ? false : 3600 * 24,
  };
}

export default PaperDetailsPage;
