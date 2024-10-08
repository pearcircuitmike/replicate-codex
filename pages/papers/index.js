import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Grid, Box, Text, Center, Skeleton } from "@chakra-ui/react";
import MetaTags from "../../components/MetaTags";
import PaperCard from "../../components/Cards/PaperCard";
import Pagination from "../../components/Pagination";
import { fetchPapersPaginated } from "../api/utils/fetchPapers";
import SemanticSearchBar from "../../components/Common/SemanticSearchBar";
import TimeRangeFilter from "../../components/Common/TimeRangeFilter";
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
  const [searchValue, setSearchValue] = useState(initialSearch || "");
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

  // Fetch papers whenever relevant state changes
  useEffect(() => {
    fetchPapers();
  }, [searchValue, selectedTimeRange, currentPage]);

  // Update URL query parameters when state changes
  useEffect(() => {
    router.replace(
      {
        pathname: "/papers",
        query: {
          search: searchValue,
          selectedTimeRange,
          page: currentPage,
        },
      },
      undefined,
      { shallow: true }
    );
  }, [searchValue, selectedTimeRange, currentPage]);

  const handleSearchSubmit = (value) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleTimeRangeChange = (newTimeRange) => {
    setSelectedTimeRange(newTimeRange);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Function to render skeletons
  const renderSkeletons = () => {
    const skeletonArray = Array.from({ length: pageSize });
    return (
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
          xl: "repeat(4, 1fr)",
        }}
        gap={6}
      >
        {skeletonArray.map((_, index) => (
          <Box key={index} p={4} borderWidth="1px" borderRadius="md">
            <Skeleton height="150px" mb={4} />
            <Skeleton height="20px" mb={2} />
            <Skeleton height="20px" width="80%" />
            <Skeleton height="20px" width="60%" mt={2} />
          </Box>
        ))}
      </Grid>
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
          onSearchSubmit={handleSearchSubmit}
          initialSearchValue={initialSearch}
          resourceType="paper" // Pass resourceType to SemanticSearchBar
        />
        <Box mt={2}>
          <TimeRangeFilter
            selectedTimeRange={selectedTimeRange}
            onTimeRangeChange={handleTimeRangeChange}
          />
        </Box>
        {papers.length === 0 && !isLoading ? (
          <Box mt={6}>
            <Text>
              No papers found. Please try a different search or time range.
            </Text>
          </Box>
        ) : (
          <>
            {isLoading ? (
              renderSkeletons()
            ) : (
              <Grid
                templateColumns={{
                  base: "repeat(1, 1fr)",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                  xl: "repeat(4, 1fr)",
                }}
                gap={6}
              >
                {papers.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
              </Grid>
            )}
            <Center my={5}>
              <Pagination
                totalCount={totalCount}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </Center>
          </>
        )}
      </Container>
    </>
  );
};

export default PapersIndexPage;
