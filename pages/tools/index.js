// pages/tools/index.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Heading, Text, Grid, GridItem, Center } from "@chakra-ui/react";
import MetaTags from "@/components/MetaTags";
import { fetchToolsPaginated } from "../api/utils/fetchTools";
import SearchBar from "@/components/Common/SearchBar";
import Pagination from "../../components/Pagination";
import ToolCard from "../../components/ToolCard";

export async function getStaticProps({ params }) {
  const currentPage = parseInt(params?.page || "1", 10);
  const searchValue = params?.search || "";

  const { data, totalCount } = await fetchToolsPaginated({
    pageSize: 20,
    currentPage,
    searchValue,
  });

  return {
    props: {
      initialTools: data,
      totalToolCount: totalCount,
      initialSearch: searchValue,
      initialPage: currentPage,
    },
    revalidate: false,
  };
}

const ToolsIndexPage = ({
  initialTools,
  totalToolCount,
  initialSearch,
  initialPage,
}) => {
  const router = useRouter();
  const [tools, setTools] = useState(initialTools);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(totalToolCount);
  const pageSize = 20;

  const fetchTools = async () => {
    const { data, totalCount } = await fetchToolsPaginated({
      pageSize,
      currentPage,
      searchValue,
    });
    setTools(data);
    setTotalCount(totalCount);
  };

  useEffect(() => {
    const { search, page } = router.query;
    setSearchValue(search || initialSearch);
    setCurrentPage(parseInt(page || initialPage.toString(), 10));
  }, [router.query]);

  useEffect(() => {
    fetchTools();
  }, [currentPage, searchValue]);

  const handleSearchSubmit = (newSearchValue) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
    router.push({
      pathname: "/tools",
      query: {
        search: newSearchValue,
        page: 1,
      },
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    router.push({
      pathname: "/tools",
      query: {
        search: searchValue,
        page: newPage,
      },
    });
  };

  return (
    <>
      <MetaTags
        title="AI Tools | AIModels.fyi"
        description="Discover the top AI tools and products."
        socialPreviewImage="https://cdn.dribbble.com/users/63554/screenshots/10844959/media/d6e4f9ccef4cce39198a4b958d0cb47f.jpg?resize=800x600&vertical=center"
        socialPreviewTitle="AI Tools Directory"
        socialPreviewSubtitle="Find and explore the top AI tools!"
      />
      <Box>
        <Box bg="gray.100" py={20}>
          <Box maxW="container.lg" mx="auto" textAlign="center">
            <Heading as="h1" size="2xl" mb={4}>
              Discover AI tools to solve your problem
            </Heading>
            <Text fontSize="xl" mb={8}>
              Get summaries of the best new tools in your inbox. Subscribe to
              the newsletter!
            </Text>
          </Box>
        </Box>
        <Box maxW="container.lg" mx="auto" my={8}>
          <Box my={3}>
            <SearchBar
              searchValue={searchValue}
              onSearchSubmit={handleSearchSubmit}
              setSearchValue={setSearchValue}
              placeholder="Search AI tools..."
            />
          </Box>
          {tools.length === 0 ? (
            <Box mt={6}>
              <Text>No tools found. Please try a different search.</Text>
            </Box>
          ) : (
            <>
              <Grid
                templateColumns={[
                  "repeat(1, 1fr)",
                  "repeat(2, 1fr)",
                  "repeat(3, 1fr)",
                  "repeat(4, 1fr)",
                ]}
                gap={6}
              >
                {tools.map((tool) => (
                  <GridItem key={tool.id}>
                    {/* 
                      Directly render ToolCard without wrapping it in an extra <Link>.
                      ToolCard already includes its own <Link> usage.
                    */}
                    <ToolCard tool={tool} />
                  </GridItem>
                ))}
              </Grid>
              <Pagination
                totalCount={totalCount}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                basePath="/tools"
                extraQuery={{ search: searchValue }}
              />
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default ToolsIndexPage;
