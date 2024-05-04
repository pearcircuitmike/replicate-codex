import React, { useState } from "react";
import {
  Container,
  Heading,
  Flex,
  Text,
  Box,
  Input,
  InputGroup,
  Center,
  Button,
  Skeleton,
} from "@chakra-ui/react";
import MetaTags from "../../components/MetaTags";
import AuthorCard from "../../components/AuthorCard";
import Pagination from "../../components/Pagination";
import { fetchUniqueAuthors } from "../../utils/fetchAuthors";

const ITEMS_PER_PAGE = 12;

export async function getStaticProps() {
  const { data, totalCount } = await fetchUniqueAuthors({
    platform: "arxiv",
    pageSize: ITEMS_PER_PAGE,
    currentPage: 1,
    searchValue: "",
  });

  return {
    props: { initialAuthors: data, initialTotalCount: totalCount || 0 },
    revalidate: 3600,
  };
}

const Authors = ({ initialAuthors, initialTotalCount }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [authors, setAuthors] = useState(initialAuthors);
  const [totalCount, setTotalCount] = useState(initialTotalCount);

  const executeSearch = async () => {
    setIsLoading(true);
    const { data, totalCount } = await fetchUniqueAuthors({
      platform: "arxiv",
      pageSize: ITEMS_PER_PAGE,
      currentPage: 1,
      searchValue: searchTerm,
    });
    setAuthors(data);
    setTotalCount(totalCount || 0);
    setCurrentPage(1);
    setIsLoading(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !isLoading) {
      executeSearch();
    }
  };

  const changePage = async (page) => {
    setIsLoading(true);
    const { data } = await fetchUniqueAuthors({
      platform: "arxiv",
      pageSize: ITEMS_PER_PAGE,
      currentPage: page,
      searchValue: searchTerm,
    });
    setAuthors(data);
    setCurrentPage(page);
    setIsLoading(false);
  };

  return (
    <>
      <MetaTags
        title="AIpapers.fyi | All Authors"
        description="Search AI paper authors."
        socialPreviewImage={`${process.env.NEXT_PUBLIC_SITE_BASE_URL}/img/ogImg/ogImg_researchers.png`}
        socialPreviewTitle="AI Researchers"
        socialPreviewSubtitle="Explore work by the top AI/ML researchers"
      />
      <Container maxW="5xl">
        <Heading as="h1" mt={5}>
          Authors
        </Heading>
        <Text mt={5}>Search through the list of authors below!</Text>
        <InputGroup mt={5}>
          <Input
            variant="outline"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by author name"
          />
          <Button
            ml={3}
            onClick={executeSearch}
            colorScheme="blue"
            isDisabled={isLoading}
          >
            Search
          </Button>
        </InputGroup>
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
          ) : authors.length > 0 ? (
            <Flex wrap="wrap" justify="center" mt={10}>
              {authors.map((author, index) => (
                <Box m={3} w="280px" key={index}>
                  <AuthorCard author={author} platform="arxiv" />
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

export default Authors;
