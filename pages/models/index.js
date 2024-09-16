import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Grid,
  Box,
  Text,
  Skeleton,
  Center,
  Spinner,
} from "@chakra-ui/react";
import MetaTags from "../../components/MetaTags";
import ModelCard from "../../components/ModelCard";
import Pagination from "../../components/Pagination";
import { fetchModelsPaginated } from "../api/utils/fetchModelsPaginated";
import SemanticSearchBar from "../../components/SemanticSearchBar";
import CategoryFilter from "../../components/CategoryFilter";
import TimeRangeFilter from "../../components/TimeRangeFilter";
import { getDateRange } from "../api/utils/dateUtils";
import modelCategoryDescriptions from "../../data/modelCategoryDescriptions.json";

export async function getStaticProps({ params }) {
  const currentPage = parseInt(params?.page || "1", 10);
  const selectedTimeRange = params?.selectedTimeRange || "thisWeek";
  const selectedCategories = params?.selectedCategories
    ? JSON.parse(params.selectedCategories)
    : Object.keys(modelCategoryDescriptions);
  const searchValue = params?.search || "";

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
    revalidate: false,
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
  const [searchValue, setSearchValue] = useState(initialSearch);
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
    fetchModels();
  }, [currentPage, selectedCategories, selectedTimeRange]);

  const handleSearchSubmit = async (semanticSearchResults) => {
    setCurrentPage(1);
    router.push(
      {
        pathname: "/models",
        query: {
          search: searchValue,
          selectedCategories: JSON.stringify(selectedCategories),
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
      setModels(semanticSearchResults);
      setTotalCount(semanticSearchResults.length);
    } else {
      await fetchModels();
    }
  };

  const handleCategoryChange = (updatedCategories) => {
    setSelectedCategories(updatedCategories);
    setCurrentPage(1);
    router.push(
      {
        pathname: "/models",
        query: {
          search: searchValue,
          selectedCategories: JSON.stringify(updatedCategories),
          selectedTimeRange,
          page: 1,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleTimeRangeChange = (newTimeRange) => {
    setSelectedTimeRange(newTimeRange);
    setCurrentPage(1);
    router.push(
      {
        pathname: "/models",
        query: {
          search: searchValue,
          selectedCategories: JSON.stringify(selectedCategories),
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
        pathname: "/models",
        query: {
          search: searchValue,
          selectedCategories: JSON.stringify(selectedCategories),
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
          searchValue={searchValue}
          onSearchSubmit={handleSearchSubmit}
          setSearchValue={setSearchValue}
          resourceType="model"
          selectedTimeRange={selectedTimeRange}
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
        {isLoading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
          </Box>
        ) : Array.isArray(models) && models.length === 0 ? (
          <Box mt={6}>
            <Text>
              No models found. Please try a different search or category.
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
              {Array.isArray(models) &&
                models.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))}
            </Grid>
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
