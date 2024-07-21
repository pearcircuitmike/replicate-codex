import React, { useState } from "react";
import {
  Container,
  Heading,
  Flex,
  Text,
  Box,
  Center,
  Skeleton,
} from "@chakra-ui/react";
import MetaTags from "../../components/MetaTags";
import CreatorCard from "../../components/CreatorCard";
import Pagination from "../../components/Pagination";
import { fetchCreators } from "../api/utils/fetchCreatorsPaginated";
import SearchBar from "../../components/SearchBar";

const ITEMS_PER_PAGE = 12;

export async function getStaticProps() {
  const { data, totalCount } = await fetchCreators({
    tableName: "unique_creators_data_view",
    pageSize: ITEMS_PER_PAGE,
    currentPage: 1,
    searchValue: "",
  });
  return {
    props: {
      initialCreators: data,
      initialTotalCount: totalCount || 0,
    },
    revalidate: false,
  };
}

const Creators = ({ initialCreators, initialTotalCount }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [creators, setCreators] = useState(initialCreators);
  const [totalCount, setTotalCount] = useState(initialTotalCount);

  const executeSearch = async (newSearchTerm) => {
    setIsLoading(true);
    const { data, totalCount } = await fetchCreators({
      tableName: "unique_creators_data_view",
      pageSize: ITEMS_PER_PAGE,
      currentPage: 1,
      searchValue: newSearchTerm,
    });
    setCreators(data);
    setTotalCount(totalCount || 0);
    setCurrentPage(1);
    setIsLoading(false);
  };

  const changePage = async (page) => {
    setIsLoading(true);
    const { data } = await fetchCreators({
      tableName: "unique_creators_data_view",
      pageSize: ITEMS_PER_PAGE,
      currentPage: page,
      searchValue: searchTerm,
    });
    setCreators(data);
    setCurrentPage(page);
    setIsLoading(false);
  };

  return (
    <>
      <MetaTags
        title="AImodels.fyi | All Creators"
        description="Search AI model creators."
        socialPreviewImage={`${process.env.NEXT_PUBLIC_SITE_BASE_URL}/img/ogImg/ogImg_creators.png`}
        socialPreviewTitle="Model Creators"
        socialPreviewSubtitle="Meet the top AI model creators on Replicate, HuggingFace, and more..."
      />
      <Container maxW="5xl">
        <Heading as="h1" mt={5}>
          Creators
        </Heading>
        <Text mt={5}>Search through the list of amazing creators below!</Text>
        <SearchBar
          placeholder="Search by creator name"
          searchValue={searchTerm}
          onSearchSubmit={executeSearch}
          setSearchValue={setSearchTerm}
          resourceType="creator"
        />
      </Container>
      <Container maxW="8xl">
        <Box minHeight="800px">
          {isLoading ? (
            <Flex wrap="wrap" justify="center" mt={10}>
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <Box m={3} w="280px" key={index}>
                  <Skeleton height="200px" />
                  <Skeleton height="20px" mt={2} />
                  <Skeleton height="20px" mt={1} />
                </Box>
              ))}
            </Flex>
          ) : creators.length > 0 ? (
            <Flex wrap="wrap" justify="center" mt={10}>
              {creators.map((creator, index) => (
                <Box m={3} w="280px" key={index}>
                  <CreatorCard creator={creator} />
                </Box>
              ))}
            </Flex>
          ) : (
            <Center mt={10}>
              <Text>No results found</Text>
            </Center>
          )}
        </Box>
      </Container>
      <Center my={5}>
        <Pagination
          currentPage={currentPage}
          totalCount={totalCount}
          onPageChange={changePage}
          pageSize={ITEMS_PER_PAGE}
        />
      </Center>
    </>
  );
};

export default Creators;
