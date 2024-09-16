import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Grid, Box, Text, Spinner } from "@chakra-ui/react";
import MetaTags from "../../components/MetaTags";
import PaperCard from "../../components/PaperCard";
import Pagination from "../../components/Pagination";
import { fetchPapersPaginated } from "../api/utils/fetchPapers";
import SemanticSearchBar from "../../components/SemanticSearchBar";
import TimeRangeFilter from "../../components/TimeRangeFilter";
import { getDateRange } from "../api/utils/dateUtils";

export async function getServerSideProps({ query }) {
  const currentPage = parseInt(query.page || "1", 10);
  const selectedTimeRange = query.selectedTimeRange || "thisWeek";
  const searchValue = query.search || "";

  const { startDate, endDate } = getDateRange(selectedTimeRange);

  const { data, totalCount } = await fetchPapersPaginated({
    platform: "arxiv",
    pageSize: 12,
    currentPage,
    searchValue,
    startDate,
    endDate,
  });

  return {
    props: {
      initialPapers: data,
      totalPaperCount: totalCount,
      initialSearch: searchValue,
      initialPage: currentPage,
      initialSelectedTimeRange: selectedTimeRange,
    },
  };
}

const PapersIndexPage = ({
  initialPapers,
  totalPaperCount,
  initialSearch,
  initialPage,
  initialSelectedTimeRange,
}) => {
  const router = useRouter();
  const [papers, setPapers] = useState(initialPapers || []);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(totalPaperCount);
  const pageSize = 12;
  const [selectedTimeRange, setSelectedTimeRange] = useState(
    initialSelectedTimeRange
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchPapers = async () => {
    setIsLoading(true);
    try {
      const { startDate, endDate } = getDateRange(selectedTimeRange);
      const { data, totalCount } = await fetchPapersPaginated({
        platform: "arxiv",
        pageSize,
        currentPage,
        searchValue,
        startDate,
        endDate,
      });
      setPapers(data || []);
      setTotalCount(totalCount);
    } catch (error) {
      console.error("Error fetching papers:", error);
      setPapers([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [currentPage, selectedTimeRange]);

  const handleSearchSubmit = async (semanticSearchResults) => {
    setCurrentPage(1);
    router.push(
      {
        pathname: "/papers",
        query: {
          search: searchValue,
          selectedTimeRange,
          page: 1,
        },
      },
      undefined,
      { shallow: true }
    );

    if (
      Array.isArray(semanticSearchResults) &&
      semanticSearchResults.length > 0
    ) {
      setPapers(semanticSearchResults);
      setTotalCount(semanticSearchResults.length);
    } else {
      await fetchPapers();
    }
  };

  const handleTimeRangeChange = (newTimeRange) => {
    setSelectedTimeRange(newTimeRange);
    setCurrentPage(1);
    router.push(
      {
        pathname: "/papers",
        query: {
          search: searchValue,
          selectedTimeRange: newTimeRange,
          page: 1,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    router.push(
      {
        pathname: "/papers",
        query: {
          search: searchValue,
          selectedTimeRange,
          page: newPage,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <>
      <MetaTags
        title="AI Papers | Explore Latest Research"
        description="Explore the latest research papers on artificial intelligence, machine learning, and related fields. Browse through summaries, categories, and authors."
        socialPreviewImage={`${process.env.NEXT_PUBLIC_SITE_BASE_URL}/img/ogImg/ogImg_papers.png`}
        socialPreviewTitle="AI/ML Research Papers"
        socialPreviewSubtitle="The all-in-one place for AI research"
      />
      <Container maxW="container.xl" py="2">
        <Box mb={6}>
          <Text fontSize="3xl" fontWeight="bold">
            AI Papers
          </Text>
          <Text fontSize="lg" color="gray.500">
            Browse and discover the latest research papers on artificial
            intelligence, machine learning, and related fields.
          </Text>
        </Box>

        <SemanticSearchBar
          placeholder="Search papers by title or arXiv ID..."
          searchValue={searchValue}
          onSearchSubmit={handleSearchSubmit}
          setSearchValue={setSearchValue}
          resourceType="paper"
          selectedTimeRange={selectedTimeRange}
        />
        <Box mt={2}>
          <TimeRangeFilter
            selectedTimeRange={selectedTimeRange}
            onTimeRangeChange={handleTimeRangeChange}
          />
        </Box>
        {isLoading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
          </Box>
        ) : Array.isArray(papers) && papers.length === 0 ? (
          <Box mt={6}>
            <Text>
              No papers found. Please try a different search or time range.
            </Text>
          </Box>
        ) : (
          <>
            <Grid
              templateColumns={{
                base: "repeat(1, 1fr)",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
                xl: "repeat(4, 1fr)",
              }}
              gap={6}
            >
              {Array.isArray(papers) &&
                papers.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
            </Grid>
            <Pagination
              totalCount={totalCount}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </Container>
    </>
  );
};

export default PapersIndexPage;
