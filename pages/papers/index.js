import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Grid, Box, Text, Center, Skeleton } from "@chakra-ui/react";

import MetaTags from "../../components/MetaTags";
import SemanticSearchBar from "../../components/Common/SemanticSearchBar";
import TimeRangeFilter from "../../components/Common/TimeRangeFilter";
import PaperCard from "../../components/Cards/PaperCard";
import Pagination from "../../components/Pagination";

import { fetchPapersPaginated } from "../api/utils/fetchPapers";
import { getDateRange } from "../api/utils/dateUtils";

export async function getServerSideProps({ query }) {
  const currentPage = parseInt(query.page || "1", 10);
  const selectedTimeRange = query.selectedTimeRange || "thisWeek";
  const searchValue = query.search || "";
  const pageSize = 12;

  const { startDate, endDate } = getDateRange(selectedTimeRange);

  // Fetch data for the current page + filters
  const { data, totalCount } = await fetchPapersPaginated({
    platform: "arxiv",
    pageSize,
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

  // Hardcode your primary domain here:
  const hardcodedDomain = "https://www.aimodels.fyi";
  // Construct full canonical URL:
  const canonicalUrl = `${hardcodedDomain}${router.asPath}`;

  const [papers, setPapers] = useState(initialPapers || []);
  const [searchValue, setSearchValue] = useState(initialSearch || "");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(totalPaperCount);
  const [selectedTimeRange, setSelectedTimeRange] = useState(
    initialSelectedTimeRange
  );
  const [isLoading, setIsLoading] = useState(false);

  const pageSize = 12; // Must match getServerSideProps

  // Fetch papers when relevant state changes
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, selectedTimeRange, currentPage]);

  // Sync query in the URL (shallow routing)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        description="Explore the latest AI and machine learning research papers."
        socialPreviewImage={`${hardcodedDomain}/img/ogImg/ogImg_papers.png`}
        socialPreviewTitle="AI/ML Research Papers"
        socialPreviewSubtitle="Explore the newest findings"
        canonicalUrl={canonicalUrl}
      />

      <Container maxW="container.xl" py="2">
        <Box mb={6}>
          <Text fontSize="3xl" fontWeight="bold">
            AI Papers
          </Text>
          <Text fontSize="lg" color="gray.500">
            Browse and discover new research on AI, ML, and related fields.
          </Text>
        </Box>

        <SemanticSearchBar
          placeholder="Search papers by title or arXiv ID..."
          onSearchSubmit={handleSearchSubmit}
          initialSearchValue={initialSearch}
          resourceType="paper"
        />

        <Box mt={2}>
          <TimeRangeFilter
            selectedTimeRange={selectedTimeRange}
            onTimeRangeChange={handleTimeRangeChange}
          />
        </Box>

        {papers.length === 0 && !isLoading ? (
          <Box mt={6}>
            <Text>No papers found. Try a different search or time range.</Text>
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
                basePath="/papers" // <<-- The correct path
                extraQuery={{
                  search: searchValue,
                  selectedTimeRange,
                }}
              />
            </Center>
          </>
        )}
      </Container>
    </>
  );
};

export default PapersIndexPage;
