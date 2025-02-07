// pages/PaperDetailsPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Grid,
  GridItem,
  Flex,
  Heading,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import MetaTags from "@/components/MetaTags";
import dynamic from "next/dynamic";

const SectionsNav = dynamic(() =>
  import("@/components/PaperDetailsPage/SectionsNav")
);
const RelatedPapers = dynamic(() => import("@/components/RelatedPapers"));
const PaperNotes = dynamic(() => import("@/components/Notes/PaperNotes"), {
  ssr: false,
});
const PaperContent = dynamic(() =>
  import("@/components/PaperDetailsPage/PaperContent")
);
const HighlightSidebar = dynamic(() => import("@/components/HighlightSidebar"));

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
      const supabase = (await import("@/pages/api/utils/supabaseClient"))
        .default;
      const { data, error } = await supabase
        .from("highlights")
        .select(
          `
          *,
          user_profile:public_profile_info!highlights_user_id_fkey (
            id,
            full_name,
            avatar_url,
            username
          )
        `
        )
        .eq("paper_id", paper.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setHighlights(data.filter((hl) => hl && hl.id));
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

  // Handler for creating a new highlight
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
      const supabase = (await import("@/pages/api/utils/supabaseClient"))
        .default;
      const newHighlight = {
        user_id: user.id,
        paper_id: paper.id,
        quote: anchor.exact,
        prefix: anchor.prefix,
        suffix: anchor.suffix,
        context_snippet:
          `${anchor.prefix}${anchor.exact}${anchor.suffix}`.slice(0, 500),
      };
      const { data, error } = await supabase
        .from("highlights")
        .insert(newHighlight)
        .select(
          `
          *,
          user_profile:public_profile_info!highlights_user_id_fkey (
            id,
            full_name,
            avatar_url,
            username
          )
        `
        )
        .single();
      if (error) throw error;
      setHighlights((prev) => [data, ...prev]);
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

  // Handler for creating a new comment
  const handleNewComment = async (anchor) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add comments",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      const supabase = (await import("@/pages/api/utils/supabaseClient"))
        .default;
      const newComment = {
        user_id: user.id,
        paper_id: paper.id,
        quote: anchor.exact,
        prefix: anchor.prefix,
        suffix: anchor.suffix,
        context_snippet:
          `${anchor.prefix}${anchor.exact}${anchor.suffix}`.slice(0, 500),
        is_comment: true,
      };
      const { data, error } = await supabase
        .from("highlights")
        .insert(newComment)
        .select(
          `
          *,
          user_profile:public_profile_info!highlights_user_id_fkey (
            id,
            full_name,
            avatar_url,
            username
          )
        `
        )
        .single();
      if (error) throw error;
      setHighlights((prev) => [data, ...prev]);
      toast({
        title: "Comment created",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error creating comment:", error);
      toast({
        title: "Error creating comment",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleHighlightClick = (highlight) => {
    setSelectedHighlightId(highlight.id);
    // Optionally, scroll the inline highlight into view.
  };

  const handleHighlightRemove = async (highlightId) => {
    if (!user) return;
    try {
      const supabase = (await import("@/pages/api/utils/supabaseClient"))
        .default;
      const { error } = await supabase
        .from("highlights")
        .delete()
        .eq("id", highlightId)
        .eq("user_id", user.id);
      if (error) throw error;
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
          templateColumns={{
            base: "minmax(0, 1fr)",
            lg: "300px minmax(0, 1fr) 250px",
          }}
          gap={{ base: 4, lg: 6 }}
          minH="100vh"
        >
          {/* Left Sidebar: HighlightSidebar */}
          <GridItem display={{ base: "none", lg: "block" }} w={{ lg: "300px" }}>
            <Box px={2} py={2} bg="white" borderRadius="md">
              <HighlightSidebar
                highlights={highlights}
                onHighlightClick={handleHighlightClick}
                onHighlightRemove={handleHighlightRemove}
                selectedHighlightId={selectedHighlightId}
              />
            </Box>
          </GridItem>

          {/* Main Content */}
          <GridItem w="100%" maxW="100%">
            <Box id="main-content">
              <Box py={4} pb={{ base: 32, lg: 24 }} px={{ base: 2, md: 4 }}>
                <PaperContent
                  paper={{ ...paper, tasks: paper.tasks || [] }}
                  hasActiveSubscription={hasActiveSubscription}
                  viewCounts={viewCounts}
                  highlights={highlights}
                  onHighlightClick={handleHighlightClick}
                  onHighlight={handleNewHighlight}
                  onComment={handleNewComment}
                />
              </Box>
            </Box>
          </GridItem>

          {/* Right Sidebar: PaperNotes */}
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
                  <Box mt={6}>
                    <PaperNotes paperId={paper.id} />
                  </Box>
                </Box>
              </Flex>
            </Box>
          </GridItem>
        </Grid>

        {/* New Section below the grid showing original navigation content */}
        <Box mt={6} bg="white" p={4} borderRadius="md">
          <Heading as="h2" size="md" mb={4}>
            Paper Navigation & Related Papers
          </Heading>
          <SectionsNav
            markdownContent={paper.generatedSummary}
            paper={{
              ...paper,
              url: `https://www.aimodels.fyi/papers/${paper.platform}/${paper.slug}`,
            }}
          />
          <RelatedPapers slug={paper.slug} platform={paper.platform} />
        </Box>
      </Container>
    </Box>
  );
}

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
  if (!paperData || !paperData.abstract || !paperData.generatedSummary) {
    return { props: { error: true, slug }, revalidate: false };
  }
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
