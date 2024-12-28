import {
  Box,
  Container,
  Heading,
  Text,
  Skeleton,
  SimpleGrid,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MetaTags from "../../../components/MetaTags";
import PaperCard from "../../../components/Cards/PaperCard";
import Pagination from "../../../components/Pagination";
import { fetchPapersByAuthor } from "../../api/utils/fetchAuthors";

const ITEMS_PER_PAGE = 10;

const LoadingCard = () => (
  <Box height="500px" borderWidth="1px" borderRadius="lg" overflow="hidden">
    <Skeleton height="250px" />
    <Box p="15px">
      <Skeleton height="20px" mb={2} />
      <Skeleton height="20px" width="80%" mb={2} />
      <Skeleton height="60px" />
    </Box>
  </Box>
);

export default function Author() {
  const router = useRouter();
  const { author } = router.query;
  const [papers, setPapers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      if (author) {
        setIsLoading(true);
        try {
          const { data, totalCount } = await fetchPapersByAuthor({
            platform: "arxiv",
            pageSize: ITEMS_PER_PAGE,
            currentPage,
            author,
          });
          setPapers(data);
          setTotalCount(totalCount);
        } catch (error) {
          console.error("Error fetching papers:", error);
        }
        setIsLoading(false);
      }
    };
    fetchPapers();
  }, [author, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <MetaTags
        title={`Papers by ${author || "Loading..."}`}
        description={`Papers authored by ${author || "Loading..."}`}
        socialPreviewImage="https://media.wired.com/photos/5b32ae248d9ebd40cd3ed997/191:100/w_1280,c_limit/emojiconference.jpg"
        socialPreviewTitle={`Papers by ${author || "Loading..."}`}
        socialPreviewSubtitle={`View ${totalCount} ${
          totalCount > 1 ? "papers" : "paper"
        } on AImodels.fyi`}
      />

      <Container maxW="container.xl" py="12">
        <Box minH="88px" mb={8}>
          <Heading as="h1" size="xl" mb="2">
            {author || <Skeleton height="40px" width="200px" />}
          </Heading>
          {isLoading ? (
            // Render the Skeleton as a <p> so it matches the DOM structure of <Text>.
            <Skeleton as="p" height="24px" width="150px" />
          ) : (
            <Text fontSize="lg" color="gray.500">
              Number of Papers: {totalCount}
            </Text>
          )}
        </Box>

        <Box minH="800px">
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
            spacing={4}
            w="100%"
          >
            {isLoading
              ? Array(ITEMS_PER_PAGE)
                  .fill(null)
                  .map((_, idx) => <LoadingCard key={`skeleton-${idx}`} />)
              : papers.map((paper) => (
                  <Box key={paper.id} height="500px">
                    <PaperCard paper={paper} />
                  </Box>
                ))}
          </SimpleGrid>
        </Box>

        {!isLoading && papers.length > 0 && (
          <Box mt={8}>
            <Pagination
              currentPage={currentPage}
              totalCount={totalCount}
              pageSize={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </Box>
        )}
      </Container>
    </>
  );
}
