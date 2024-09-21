import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Grid, Box, Text, Center, Skeleton } from "@chakra-ui/react";
import MetaTags from "../../components/MetaTags";
import ModelCard from "../../components/ModelCard";
import Pagination from "../../components/Pagination";
import { fetchModelsPaginated } from "../api/utils/fetchModelsPaginated";
import SemanticSearchBar from "../../components/SemanticSearchBar";
import CategoryFilter from "../../components/CategoryFilter";
import TimeRangeFilter from "../../components/TimeRangeFilter";
import { getDateRange } from "../api/utils/dateUtils";
import modelCategoryDescriptions from "../../data/modelCategoryDescriptions.json";

export async function getServerSideProps({ query }) {
  const currentPage = parseInt(query.page || "1", 10);
  const selectedTimeRange = query.selectedTimeRange || "thisWeek";
  const selectedCategories = query.selectedCategories
    ? JSON.parse(query.selectedCategories)
    : Object.keys(modelCategoryDescriptions);
  const searchValue = query.search || "";

  const { startDate, endDate } = getDateRange(selectedTimeRange);

  const { data, totalCount } = await fetchModelsPaginated({
    tableName: "modelsData",
    pageSize: 12,
    currentPage,
    searchValue,
    selectedCategories,
    startDate,
    endDate,
  });

  return {
    props: {
      initialModels: data,
      totalModelCount: totalCount,
      initialSearch: searchValue,
      initialSelectedCategories: selectedCategories,
      initialPage: currentPage,
      initialSelectedTimeRange: selectedTimeRange,
    },
  };
}

const ModelsIndexPage = ({
  initialModels,
  totalModelCount,
  initialSearch,
  initialSelectedCategories,
  initialPage,
  initialSelectedTimeRange,
}) => {
  const router = useRouter();
  const [models, setModels] = useState(initialModels || []);
  const [searchValue, setSearchValue] = useState(initialSearch || "");
  const [selectedCategories, setSelectedCategories] = useState(
    initialSelectedCategories
  );
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(totalModelCount);
  const pageSize = 12;
  const [selectedTimeRange, setSelectedTimeRange] = useState(
    initialSelectedTimeRange
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const { startDate, endDate } = getDateRange(selectedTimeRange);

      const { data, totalCount } = await fetchModelsPaginated({
        tableName: "modelsData",
        pageSize,
        currentPage,
        searchValue,
        selectedCategories,
        startDate,
        endDate,
      });
      setModels(data || []);
      setTotalCount(totalCount);
    } catch (error) {
      console.error("Error fetching models:", error);
      setModels([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch models whenever relevant state changes
  useEffect(() => {
    fetchModels();
  }, [searchValue, selectedCategories, selectedTimeRange, currentPage]);

  // Update URL query parameters when state changes
  useEffect(() => {
    router.replace(
      {
        pathname: "/models",
        query: {
          search: searchValue,
          selectedCategories: JSON.stringify(selectedCategories),
          selectedTimeRange,
          page: currentPage,
        },
      },
      undefined,
      { shallow: true }
    );
  }, [searchValue, selectedCategories, selectedTimeRange, currentPage]);

  const handleSearchSubmit = (value) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (updatedCategories) => {
    setSelectedCategories(updatedCategories);
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
            <Skeleton height="200px" mb={4} />
            <Skeleton height="20px" mb={2} />
            <Skeleton height="20px" width="80%" />
          </Box>
        ))}
      </Grid>
    );
  };

  return (
    <>
      <MetaTags
        title="AI Models | Browse and Discover AI Models"
        description="Explore a wide range of AI models across different categories. Browse through model descriptions, examples, and more."
        socialPreviewImage={`${process.env.NEXT_PUBLIC_SITE_BASE_URL}/img/ogImg/ogImg_models.png`}
        socialPreviewTitle="AI Models"
        socialPreviewSubtitle="Explore the latest AI models"
      />
      <Container maxW="container.xl" py="2">
        <Box mb={6}>
          <Text fontSize="3xl" fontWeight="bold">
            AI Models
          </Text>
          <Text fontSize="lg" color="gray.500">
            Browse and discover AI models across various categories.
          </Text>
        </Box>
        <SemanticSearchBar
          placeholder="Search by model name..."
          onSearchSubmit={handleSearchSubmit}
          initialSearchValue={initialSearch}
        />
        <CategoryFilter
          categoryDescriptions={modelCategoryDescriptions}
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          isModelsPage
        />
        <TimeRangeFilter
          selectedTimeRange={selectedTimeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />
        {models.length === 0 && !isLoading ? (
          <Box mt={6}>
            <Text>
              No models found. Please try a different search, category, or time
              range.
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
                {models.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </Grid>
            )}
            <Center my={5}>
              <Pagination
                currentPage={currentPage}
                totalCount={totalCount}
                onPageChange={handlePageChange}
                pageSize={pageSize}
              />
            </Center>
          </>
        )}
      </Container>
    </>
  );
};

export default ModelsIndexPage;
