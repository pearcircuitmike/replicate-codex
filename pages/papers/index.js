// pages/papers/index.js
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Grid, Box, Text } from "@chakra-ui/react";
import MetaTags from "../../components/MetaTags";
import PaperCard from "../../components/PaperCard";
import Pagination from "../../components/Pagination";
import { fetchPapersPaginated } from "../../utils/fetchPapers";
import PaperMatchmaker from "../../components/PaperMatchmaker";
import SearchBar from "../../components/SearchBar";
import CategoryFilter from "../../components/CategoryFilter";
import TimeRangeFilter from "../../components/TimeRangeFilter";
import { getDateRange } from "../../utils/dateUtils";
import categoryDescriptions from "../../data/categoryDescriptions.json";

export async function getStaticProps({ params }) {
  const currentPage = parseInt(params?.page || "1", 10);
  const selectedTimeRange = params?.selectedTimeRange || "thisWeek";
  const selectedCategories = params?.selectedCategories
    ? JSON.parse(params.selectedCategories)
    : Object.keys(categoryDescriptions);
  const searchValue = params?.search || "";

  const { startDate, endDate } = getDateRange(selectedTimeRange);

  const { data, totalCount } = await fetchPapersPaginated({
    platform: "arxiv",
    pageSize: 20,
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
    revalidate: 3600,
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
    const { search, selectedCategories, selectedTimeRange, page } =
      router.query;

    setSearchValue(search || initialSearch);
    setSelectedCategories(
      selectedCategories
        ? JSON.parse(selectedCategories)
        : initialSelectedCategories
    );
    setSelectedTimeRange(selectedTimeRange || initialSelectedTimeRange);
    setCurrentPage(parseInt(page || initialPage.toString(), 10));
  }, [router.query]);

  useEffect(() => {
    fetchPapers();
  }, [currentPage, selectedCategories, searchValue, selectedTimeRange]);

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
      <Container maxW="container.xl" py="12">
        <Box mb={6}>
          <Text fontSize="3xl" fontWeight="bold">
            AI Papers
          </Text>
          <Text fontSize="lg">
            Browse and discover the latest research papers on artificial
            intelligence, machine learning, and related fields.
          </Text>
        </Box>
        {/* <PaperMatchmaker />  KEEP THIS DO NOT DELETE*/}
        <SearchBar
          placeholder={"Search papers by title or arXiv ID..."}
          searchValue={searchValue}
          onSearchSubmit={handleSearchSubmit}
          setSearchValue={setSearchValue}
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
