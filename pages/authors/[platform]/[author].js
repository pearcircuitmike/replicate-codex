import React from "react";
import { Box, Container, Heading, Text, SimpleGrid } from "@chakra-ui/react";

import MetaTags from "../../../components/MetaTags";
import PaperCard from "../../../components/Cards/PaperCard";
import Pagination from "../../../components/Pagination";
import { fetchPapersByAuthor } from "../../api/utils/fetchAuthors";

/**
 * The number of items per page
 */
const ITEMS_PER_PAGE = 10;

/**
 * SSR to fetch "platform", "author", "page" from the route,
 * plus data for that page. No "loading..." for meta tags needed:
 * we have real data on the server immediately.
 */
export async function getServerSideProps(context) {
  const { platform, author, page = "1" } = context.query; // from dynamic route + query

  // Convert page to a number
  const currentPage = parseInt(page, 10);

  // If you truly ALWAYS have "arxiv" for platform, you could default that:
  // const safePlatform = platform || "arxiv";
  // But let's assume platform is provided.

  let papers = [];
  let totalCount = 0;

  try {
    // Fetch data on the server side
    const result = await fetchPapersByAuthor({
      platform, // e.g. "arxiv"
      pageSize: ITEMS_PER_PAGE,
      currentPage,
      author,
    });
    papers = result.data;
    totalCount = result.totalCount;
  } catch (err) {
    console.error("Error fetching author’s papers:", err);
  }

  // Build the canonical link on the server
  const DOMAIN = "https://www.aimodels.fyi";
  // e.g. /authors/arxiv/Alexander%20Waibel?page=2
  let canonicalPath = `/authors/${encodeURIComponent(
    platform
  )}/${encodeURIComponent(author)}`;
  if (currentPage > 1) {
    canonicalPath += `?page=${currentPage}`;
  }
  const canonicalUrl = DOMAIN + canonicalPath;

  // Build a friendly title/description
  const title = author ? `Papers by ${author}` : "Papers by Author";
  const description = `Papers authored by ${author || "Author"}`;

  return {
    props: {
      // Data for rendering
      platform,
      author,
      currentPage,
      papers,
      totalCount,
      // For meta
      title,
      description,
      canonicalUrl,
    },
  };
}

/**
 * The page component receives "platform", "author", "papers", etc. as props
 * already hydrated from the server. No more "loading..." needed!
 */
export default function AuthorDetailPage(props) {
  const {
    platform,
    author,
    currentPage,
    papers,
    totalCount,
    title,
    description,
    canonicalUrl,
  } = props;

  // Handle pagination in client: we'll fetch a new SSR page
  // by navigating to the next route with the correct query
  const handlePageChange = (newPage) => {
    // Because we are server-rendering, let's just navigate
    // to the new page with window.location or next/router.
    // This triggers SSR again, giving fresh data + correct meta instantly.
    window.scrollTo({ top: 0, behavior: "smooth" });
    const newUrl = `/authors/${encodeURIComponent(
      platform
    )}/${encodeURIComponent(author)}?page=${newPage}`;
    window.location.href = newUrl;
  };

  return (
    <>
      <MetaTags
        title={title}
        description={description}
        socialPreviewImage="https://media.wired.com/photos/5b32ae248d9ebd40cd3ed997/191:100/w_1280,c_limit/emojiconference.jpg"
        socialPreviewTitle={title}
        socialPreviewSubtitle={`View ${totalCount} ${
          totalCount === 1 ? "paper" : "papers"
        } on AImodels.fyi`}
        canonicalUrl={canonicalUrl} // The real final URL, from SSR
      />

      <Container maxW="container.xl" py="12">
        <Box mb={8}>
          <Heading as="h1" size="xl" mb="2">
            {author}
          </Heading>
          <Text fontSize="lg" color="gray.500">
            Number of Papers: {totalCount}
          </Text>
        </Box>

        <Box minH="800px">
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
            {papers && papers.length > 0 ? (
              papers.map((paper) => <PaperCard key={paper.id} paper={paper} />)
            ) : (
              <Text>No papers found.</Text>
            )}
          </SimpleGrid>
        </Box>

        {papers && papers.length > 0 && (
          <Box mt={8}>
            <Pagination
              currentPage={parseInt(currentPage, 10)}
              totalCount={totalCount}
              pageSize={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
              // So the links remain on authors/<platform>/<author>
              basePath={`/authors/${encodeURIComponent(
                platform
              )}/${encodeURIComponent(author)}`}
            />
          </Box>
        )}
      </Container>
    </>
  );
}
