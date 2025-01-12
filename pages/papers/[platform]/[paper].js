// pages/papers/[platform]/[paper].js

import React, { useState, useEffect } from "react";
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

// ------------------------------
// Import MetaTags with SSR
// ------------------------------
import MetaTags from "@/components/MetaTags";

// Dynamic imports (with SSR disabled in some cases)
import dynamic from "next/dynamic";
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

import RelatedPapers from "@/components/RelatedPapers";
import {
  fetchPaperDataBySlug,
  fetchPapersPaginated,
} from "@/pages/api/utils/fetchPapers";

// -----------------------------------------------------
// Component
// -----------------------------------------------------
function PaperDetailsPage({ paper, slug, error, canonicalUrl }) {
  const { hasActiveSubscription } = useAuth();
  const [viewCounts, setViewCounts] = useState({
    totalUniqueViews: 0,
    uniqueResources: [],
    canViewFullArticle: true,
  });

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

  return (
    <Box maxW="100vw" overflowX="hidden">
      {/* Server-rendered meta tags with canonical URL */}
      <MetaTags
        title={`${paper.title} | AI Research Paper Details`}
        description={paper.abstract}
        socialPreviewImage={paper.thumbnail}
        socialPreviewTitle={paper.title}
        socialPreviewSubtitle={paper.abstract}
        canonicalUrl={canonicalUrl}
      />

      <Container
        maxW={{ base: "100%", xl: "8xl" }}
        px={{ base: 2, md: 4 }}
        mx="auto"
      >
        <Grid
          templateColumns={{
            base: "minmax(0, 1fr)",
            lg: "200px minmax(0, 1fr) 250px",
          }}
          gap={{ base: 4, lg: 6 }}
          minH="100vh"
        >
          {/* Left Sidebar */}
          <GridItem display={{ base: "none", lg: "block" }} w={{ lg: "200px" }}>
            <Box /* No sticky, no maxH, no overflow */ px={2} py={2} bg="white">
              <SectionsNav
                markdownContent={paper.generatedSummary}
                paper={{
                  ...paper,
                  url: `https://www.aimodels.fyi/papers/${paper.platform}/${paper.slug}`,
                }}
              />

              <RelatedPapers slug={paper.slug} platform={paper.platform} />
            </Box>
          </GridItem>

          {/* Main Content (no forced scrollbar) */}
          <GridItem w="100%" maxW="100%">
            <Box id="main-content">
              <Box py={4} pb={{ base: 32, lg: 24 }} px={{ base: 2, md: 4 }}>
                <PaperContent
                  paper={{
                    ...paper,
                    tasks: paper.tasks || [],
                  }}
                  hasActiveSubscription={hasActiveSubscription}
                  viewCounts={viewCounts}
                  // No relatedPapers in the main content
                  relatedPapers={[]}
                />
              </Box>
            </Box>
          </GridItem>

          {/* Right Sidebar */}
          <GridItem display={{ base: "none", lg: "block" }} w={{ lg: "250px" }}>
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
}

// -----------------------------------------------------
// getStaticPaths
// -----------------------------------------------------
export async function getStaticPaths() {
  const platforms = ["arxiv"];
  const paths = [];
  const pageSize = 1000;
  const totalLimit = 10000;

  for (const platform of platforms) {
    let currentPage = 1;
    let totalFetched = 0;

    while (totalFetched < totalLimit) {
      const { data: papers } = await fetchPapersPaginated({
        platform,
        pageSize,
        currentPage,
      });

      if (!papers || papers.length === 0) break;

      for (const p of papers) {
        paths.push({
          params: { paper: p.slug.toString(), platform },
        });
      }

      totalFetched += papers.length;
      if (papers.length < pageSize || totalFetched >= totalLimit) break;
      currentPage += 1;
    }
  }

  return { paths, fallback: true };
}

// -----------------------------------------------------
// getStaticProps
// -----------------------------------------------------
export async function getStaticProps({ params }) {
  const { platform, paper: slug } = params;
  let paperData = null;
  let error = false;

  try {
    paperData = await fetchPaperDataBySlug(slug, platform);
  } catch (err) {
    console.error("Error fetching paper data:", err);
    error = true;
  }

  // If no data or missing essential fields
  if (!paperData || !paperData.abstract || !paperData.generatedSummary) {
    return {
      props: { error: true, slug },
      revalidate: false,
    };
  }

  // Build a canonical URL on the server
  const DOMAIN = "https://www.aimodels.fyi"; // adjust if needed
  const canonicalUrl = `${DOMAIN}/papers/${encodeURIComponent(
    platform
  )}/${encodeURIComponent(slug)}`;

  return {
    props: {
      paper: paperData,
      slug,
      error: false,
      canonicalUrl,
    },
    revalidate: false,
  };
}

export default PaperDetailsPage;
