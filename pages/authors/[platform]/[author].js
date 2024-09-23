import { Box, Container, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MetaTags from "../../../components/MetaTags";
import PaperCard from "../../../components/Cards/PaperCard";
import Pagination from "../../../components/Pagination";
import { fetchPapersByAuthor } from "../../api/utils/fetchAuthors";

const ITEMS_PER_PAGE = 10;

export default function Author() {
  const router = useRouter();
  const { author } = router.query;
  const [papers, setPapers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchPapers = async () => {
      if (author) {
        const { data, totalCount } = await fetchPapersByAuthor({
          platform: "arxiv",
          pageSize: ITEMS_PER_PAGE,
          currentPage,
          author,
        });
        setPapers(data);
        setTotalCount(totalCount);
      }
    };
    fetchPapers();
  }, [author, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <MetaTags
        title={`Papers by ${author}`}
        description={`Papers authored by ${author}`}
        socialPreviewImage="https://media.wired.com/photos/5b32ae248d9ebd40cd3ed997/191:100/w_1280,c_limit/emojiconference.jpg"
        socialPreviewTitle={`Papers by ${author}`}
        socialPreviewSubtitle={`View ${totalCount} ${
          totalCount > 1 ? "papers" : "paper"
        } on AImodels.fyi`}
      />
      <Container maxW="container.xl" py="12">
        <Heading as="h1" size="xl" mb="2">
          {author}
        </Heading>
        <Text fontSize="lg" color="gray.500" mb="8">
          Number of Papers: {totalCount}
        </Text>
        <Heading as="h2" size="lg" mt={2}>
          Papers by this author
        </Heading>
        <Box my={2} display="flex" flexWrap="wrap">
          {papers.map((paper) => (
            <Box
              key={paper.id}
              width={{ base: "100%", sm: "50%", md: "33%", lg: "25%" }}
              p="4"
            >
              <PaperCard paper={paper} />
            </Box>
          ))}
        </Box>
        <Pagination
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      </Container>
    </>
  );
}
