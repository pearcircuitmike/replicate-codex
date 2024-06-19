// pages/tools/index.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Heading, Text, Grid, GridItem, Center } from "@chakra-ui/react";
import MetaTags from "@/components/MetaTags";
import { fetchToolsPaginated } from "../../utils/fetchTools";
import SearchBar from "../../components/SearchBar";
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

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://substackcdn.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    const customScript = document.createElement("script");
    customScript.innerHTML = `
      window.CustomSubstackWidget = {
        substackUrl: "aimodels.substack.com",
        placeholder: "example@gmail.com",
        buttonText: "Try it for free!",
        theme: "custom",
        colors: {
          primary: "#319795",
          input: "white",
          email: "#1A202C",
          text: "white",
        },
        redirect: "/thank-you?source=tools"
      };
    `;
    document.body.appendChild(customScript);

    const widgetScript = document.createElement("script");
    widgetScript.src = "https://substackapi.com/widget.js";
    widgetScript.async = true;
    document.body.appendChild(widgetScript);

    return () => {
      document.body.removeChild(script);
      document.body.removeChild(customScript);
      document.body.removeChild(widgetScript);
    };
  }, []);

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
            <Center>
              <div id="custom-substack-embed"></div>
            </Center>
          </Box>
        </Box>
        <Box maxW="container.lg" mx="auto" my={8}>
          <SearchBar
            searchValue={searchValue}
            onSearchSubmit={handleSearchSubmit}
            setSearchValue={setSearchValue}
            placeholder="Search AI tools..."
          />
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
                    <ToolCard tool={tool} />
                  </GridItem>
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
        </Box>
      </Box>
    </>
  );
};

export default ToolsIndexPage;
