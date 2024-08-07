import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Grid, Box, Text } from "@chakra-ui/react";
import MetaTags from "../../components/MetaTags";
import PaperCard from "../../components/PaperCard";
import Pagination from "../../components/Pagination";
import { fetchPapersPaginated } from "../api/utils/fetchPapers";
import SearchBar from "../../components/SearchBar";
import CategoryFilter from "../../components/CategoryFilter";
import TimeRangeFilter from "../../components/TimeRangeFilter";
import { getDateRange } from "../api/utils/dateUtils";
import categoryDescriptions from "../../data/categoryDescriptions.json";

export async function getServerSideProps({ query }) {
  const currentPage = parseInt(query.page || "1", 10);
  const selectedTimeRange = query.selectedTimeRange || "thisWeek";
  const selectedCategories = query.selectedCategories
    ? JSON.parse(query.selectedCategories)
    : Object.keys(categoryDescriptions);
  const searchValue = query.search || "";

  const { startDate, endDate } = getDateRange(selectedTimeRange);

  const { data, totalCount } = await fetchPapersPaginated({
    platform: "arxiv",
    pageSize: 16,
    currentPage,
    searchValue,
    selectedCategories,
    startDate,
    endDate,
  });

  return {
    props: {
      initialPapers: data,
      totalPaperCount: totalCount,
      initialSearch: searchValue,
      initialSelectedCategories: selectedCategories,
      initialPage: currentPage,
      initialSelectedTimeRange: selectedTimeRange,
    },
  };
}

const PapersIndexPage = ({
  initialPapers,
  totalPaperCount,
  initialSearch,
  initialSelectedCategories,
  initialPage,
  initialSelectedTimeRange,
}) => {
  const router = useRouter();
  const [papers, setPapers] = useState(initialPapers);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState(
    initialSelectedCategories
  );
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(totalPaperCount);
  const pageSize = 20;
  const [selectedTimeRange, setSelectedTimeRange] = useState(
    initialSelectedTimeRange
  );

  const fetchPapers = async () => {
    const { startDate, endDate } = getDateRange(selectedTimeRange);

    const { data, totalCount } = await fetchPapersPaginated({
      platform: "arxiv",
      pageSize,
      currentPage,
      searchValue,
      selectedCategories,
      startDate,
      endDate,
    });
    setPapers(data);
    setTotalCount(totalCount);
  };

  useEffect(() => {
    fetchPapers();
  }, [currentPage, selectedCategories, selectedTimeRange]);

  const handleSearchSubmit = (newSearchValue) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
    router.push({
      pathname: "/papers",
      query: {
        search: newSearchValue,
        selectedCategories: JSON.stringify(selectedCategories),
        selectedTimeRange,
        page: 1,
      },
    });
    fetchPapers(); // Fetch papers on search submit
  };

  const handleCategoryChange = (updatedCategories) => {
    setSelectedCategories(updatedCategories);
    setCurrentPage(1);
    router.push({
      pathname: "/papers",
      query: {
        search: searchValue,
        selectedCategories: JSON.stringify(updatedCategories),
        selectedTimeRange,
        page: 1,
      },
    });
  };

  const handleTimeRangeChange = (newTimeRange) => {
    setSelectedTimeRange(newTimeRange);
    setCurrentPage(1);
    router.push({
      pathname: "/papers",
      query: {
        search: searchValue,
        selectedCategories: JSON.stringify(selectedCategories),
        selectedTimeRange: newTimeRange,
        page: 1,
      },
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    router.push({
      pathname: "/papers",
      query: {
        search: searchValue,
        selectedCategories: JSON.stringify(selectedCategories),
        selectedTimeRange,
        page: newPage,
      },
    });
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

        <SearchBar
          placeholder="Search papers by title or arXiv ID..."
          searchValue={searchValue}
          onSearchSubmit={handleSearchSubmit}
          setSearchValue={setSearchValue}
          resourceType="paper"
        />
        <CategoryFilter
          categoryDescriptions={categoryDescriptions}
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          isModelsPage={false}
        />
        <TimeRangeFilter
          selectedTimeRange={selectedTimeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />
        {papers.length === 0 ? (
          <Box mt={6}>
            <Text>
              No papers found. Please try a different search or category.
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
              {papers.map((paper) => (
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
