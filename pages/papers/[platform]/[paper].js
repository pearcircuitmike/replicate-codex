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
  Link,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import AuthForm from "@/components/AuthForm"; // <-- For "Get Notified" signup
import MetaTags from "@/components/MetaTags";
import dynamic from "next/dynamic";

// Paper Vote
import PaperVote from "@/components/PaperDetailsPage/PaperVote";

// Dynamically imported components
const RelatedPapers = dynamic(() => import("@/components/RelatedPapers"));
const PaperNotes = dynamic(() => import("@/components/Notes/PaperNotes"), {
  ssr: false,
});
const PaperContent = dynamic(() =>
  import("@/components/PaperDetailsPage/PaperContent")
);
const HighlightSidebar = dynamic(() => import("@/components/HighlightSidebar"));

// Utilities
import {
  fetchPaperDataBySlug,
  fetchPapersPaginated,
} from "@/pages/api/utils/fetchPapers";

function PaperDetailsPage({ paper, slug, error, canonicalUrl }) {
  const { hasActiveSubscription, user } = useAuth();
  const toast = useToast();

  const [viewCounts, setViewCounts] = useState({
    totalUniqueViews: 0,
    uniqueResources: [],
    canViewFullArticle: true,
  });
  const [highlights, setHighlights] = useState([]);
  const [selectedHighlightId, setSelectedHighlightId] = useState(null);

  useEffect(() => {
    if (!paper?.slug) return;
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem("sessionId", sessionId);
    }
    axios
      .get(`/api/resource-view-count`, {
        params: { session_id: sessionId, resource_type: "papers" },
      })
      .then((response) => {
        if (!response.data) throw new Error("Failed to fetch view counts");
        setViewCounts(response.data);
      })
      .catch((err) => {
        console.error("Error fetching view counts:", err);
      });
  }, [paper?.slug]);

  useEffect(() => {
    if (!paper?.id) return;
    fetchHighlights();
  }, [paper?.id]);

  const fetchHighlights = async () => {
    try {
      const response = await axios.get("/api/highlights/manage-highlights", {
        params: { paper_id: paper.id },
      });
      setHighlights(response.data);
    } catch (error) {
      console.error("Error fetching highlights:", error);
      toast({
        title: "Error fetching highlights",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleNewHighlight = async (anchor) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create highlights",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      const newHighlight = {
        user_id: user.id,
        paper_id: paper.id,
        quote: anchor.exact,
        prefix: anchor.prefix,
        suffix: anchor.suffix,
        text_position: anchor.text_position,
        context_snippet:
          `${anchor.prefix}${anchor.exact}${anchor.suffix}`.slice(0, 500),
      };

      const response = await axios.post(
        "/api/highlights/manage-highlights",
        newHighlight
      );
      setHighlights((prev) => [response.data, ...prev]);
      toast({
        title: "Highlight created",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error creating highlight:", error);
      toast({
        title: "Error creating highlight",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleHighlightClick = (highlight) => {
    setSelectedHighlightId(highlight.id);
  };

  const handleHighlightRemove = async (highlightId) => {
    if (!user) return;
    try {
      await axios.delete("/api/highlights/manage-highlights", {
        data: { highlight_id: highlightId, user_id: user.id },
      });
      setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
      setSelectedHighlightId(null);
      toast({
        title: "Highlight removed",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error removing highlight:", error);
      toast({
        title: "Error removing highlight",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
          templateColumns={{ base: "1fr", lg: "300px 1fr 250px" }}
          templateRows="auto auto"
          rowGap={6}
          columnGap={{ base: 4, lg: 6 }}
          mt={6}
          minH="100vh"
        >
          {/* Header - Left Column */}
          <GridItem display={{ base: "none", lg: "block" }} />

          {/* Header - Middle Column */}
          <GridItem>
            <Box bg="white" rounded="md" p={4}>
              <Grid templateColumns="auto 1fr" gap={4} alignItems="center">
                <GridItem>
                  <PaperVote paperId={paper.id} variant="vertical" size="md" />
                </GridItem>
                <GridItem>
                  <Heading as="h1" size="lg">
                    {paper.title}
                  </Heading>
                  <Box fontSize="sm" color="gray.600" mt={1}>
                    <Text as="span">
                      Published{" "}
                      {new Date(paper.publishedDate).toLocaleDateString()} by{" "}
                    </Text>
                    {paper.authors?.slice(0, 7).map((author, idx) => (
                      <React.Fragment key={author}>
                        <Link
                          href={`/authors/${paper.platform}/${author}`}
                          color="blue.500"
                          _hover={{ textDecoration: "underline" }}
                        >
                          {author}
                        </Link>
                        {idx < 6 && idx < paper.authors.length - 1 && ", "}
                      </React.Fragment>
                    ))}
                    {paper.authors?.length > 7 && (
                      <Text as="span">
                        {" and "}
                        {paper.authors.length - 7} more...
                      </Text>
                    )}
                  </Box>
                </GridItem>
              </Grid>
            </Box>
          </GridItem>

          {/* Header - Right Column */}
          <GridItem display={{ base: "none", lg: "block" }} />

          {/* MAIN CONTENT - Left Column: Highlights */}
          <GridItem display={{ base: "none", lg: "block" }}>
            <Box bg="white" p={2} borderRadius="md">
              <HighlightSidebar
                highlights={highlights}
                onHighlightClick={handleHighlightClick}
                onHighlightRemove={handleHighlightRemove}
                selectedHighlightId={selectedHighlightId}
              />
            </Box>
          </GridItem>

          {/* MAIN CONTENT - Middle Column */}
          <GridItem>
            {/* "Get Notified" block goes here, just above PaperContent */}
            {!user && (
              <Box
                my={6}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                <Text align="center" fontWeight="bold" mb={4} fontSize="lg">
                  Get notified when new papers like this one come out!
                </Text>
                <AuthForm signupSource="auth-form-embed" isUpgradeFlow />
              </Box>
            )}

            <PaperContent
              paper={{ ...paper, tasks: paper.tasks || [] }}
              hasActiveSubscription={hasActiveSubscription}
              viewCounts={viewCounts}
              highlights={highlights}
              onHighlightClick={handleHighlightClick}
              onHighlight={handleNewHighlight}
            />

            <Box mt={6} bg="white" p={4} borderRadius="md">
              <RelatedPapers slug={paper.slug} platform={paper.platform} />
            </Box>
          </GridItem>

          {/* MAIN CONTENT - Right Column: Paper Notes */}
          <GridItem display={{ base: "none", lg: "block" }}>
            <Box
              position="sticky"
              top="0"
              height="100vh"
              overflowY="auto"
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
                  <Box mt={6}>
                    <PaperNotes paperId={paper.id} />
                  </Box>
                </Box>
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

  // If we can’t load the data or the paper is missing crucial fields, fallback
  if (!paperData || !paperData.abstract || !paperData.generatedSummary) {
    return { props: { error: true, slug }, revalidate: false };
  }

  // Build canonical URL
  const DOMAIN = "https://www.aimodels.fyi";
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
