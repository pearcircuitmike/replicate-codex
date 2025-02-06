// PaperContent.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Link,
  VStack,
  Grid,
  GridItem,
  useToast,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import rehypeRaw from "rehype-raw";
import dynamic from "next/dynamic";

const RelatedPapers = dynamic(() => import("@/components/RelatedPapers"));
const PDFViewer = dynamic(
  () => import("@/components/PaperDetailsPage/PDFViewer"),
  {
    ssr: false,
    loading: () => <p>Loading PDF Viewer...</p>,
  }
);

import PaperFigures from "./PaperFigures";
import PaperTables from "./PaperTables";
import PaperVote from "./PaperVote";
import LimitMessage from "@/components/LimitMessage";
import customTheme from "@/components/MarkdownTheme";
import { useAuth } from "@/context/AuthContext";
import ContextualHighlighter from "../ContextualHighlighter";
import InjectedHighlights from "../InjectedHighlights";
import HighlightSidebar from "../HighlightSidebar";

function PaperContent({
  paper,
  hasActiveSubscription,
  viewCounts,
  relatedPapers,
}) {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState([]);
  const [selectedHighlightId, setSelectedHighlightId] = useState(null);
  const contentRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    fetchHighlights();
  }, [paper.id]);

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
      console.log("Fetched highlights:", data);
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

  const handleNewHighlight = async (anchor) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create highlights",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
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

      console.log("Created new highlight:", data);
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

  const handleNewComment = async (anchor) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add comments",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
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

      console.log("Created new comment:", data);
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

    const el = contentRef.current?.querySelector(
      `mark[data-highlight-id="${highlight.id}"], [data-full-element-highlight="true"][data-highlight-id="${highlight.id}"]`
    );

    if (el) {
      console.log("Scrolling to highlight element:", el);
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      const originalColor = el.style.backgroundColor;
      el.style.backgroundColor = "rgba(255, 255, 0, 0.5)";
      setTimeout(() => {
        el.style.backgroundColor = originalColor;
      }, 1000);
    } else {
      console.warn("No element found for highlight id:", highlight.id);
    }
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

      console.log("Removed highlight id:", highlightId);
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

  return (
    <Box bg="white" rounded="lg" p={{ base: 3, md: 6 }} maxW="100%">
      <VStack spacing={5} align="stretch">
        <Box mb={5}>
          <Grid templateColumns="auto 1fr" gap={4}>
            <GridItem>
              <PaperVote paperId={paper.id} variant="vertical" size="md" />
            </GridItem>
            <GridItem>
              <Heading as="h1" size="lg" noOfLines={2}>
                {paper.title}
              </Heading>
              <Box fontSize="sm" color="gray.600" mt={1}>
                <Text as="span">
                  Published {new Date(paper.publishedDate).toLocaleDateString()}{" "}
                  by{" "}
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
        {!hasActiveSubscription && !viewCounts?.canViewFullArticle ? (
          <LimitMessage />
        ) : (
          <Grid templateColumns={{ base: "1fr", lg: "1fr 300px" }} gap={6}>
            <GridItem>
              <ContextualHighlighter
                onHighlight={handleNewHighlight}
                onComment={handleNewComment}
              >
                <Box
                  ref={contentRef}
                  position="relative"
                  className="markdown-content"
                >
                  <ReactMarkdown
                    components={ChakraUIRenderer(customTheme)}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {paper.generatedSummary}
                  </ReactMarkdown>
                  <InjectedHighlights
                    containerRef={contentRef}
                    highlights={highlights}
                    onHighlightClick={handleHighlightClick}
                  />
                </Box>
              </ContextualHighlighter>
              {paper.figures && paper.figures.length > 0 && (
                <PaperFigures figures={paper.figures} />
              )}
              {paper.tables && paper.tables.length > 0 && (
                <PaperTables tables={paper.tables} />
              )}
            </GridItem>
            <GridItem>
              <HighlightSidebar
                highlights={highlights}
                onHighlightClick={handleHighlightClick}
                onHighlightRemove={(id) => {
                  const highlight = highlights.find((h) => h.id === id);
                  if (highlight?.user_id === user.id) {
                    handleHighlightRemove(id);
                  }
                }}
                selectedHighlightId={selectedHighlightId}
              />
              {relatedPapers && <RelatedPapers papers={relatedPapers} />}
            </GridItem>
          </Grid>
        )}
      </VStack>
    </Box>
  );
}

export default PaperContent;
