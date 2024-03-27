import React, { useState, useEffect } from "react";
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
import Head from "next/head";
import MetaTags from "../../components/MetaTags";
import ModelCard from "../../components/ModelCard";
import Pagination from "../../components/Pagination";
import { fetchModelsPaginated } from "../../utils/fetchModelsPaginated";

const pageSize = 12;

export async function getStaticProps() {
  const { data, totalCount } = await fetchModelsPaginated({
    tableName: "combinedModelsData",
    pageSize,
    currentPage: 1,
    searchValue: "",
  });

  return {
    props: { modelVals: data, totalCount: totalCount || 0 },
    revalidate: 60,
  };
}

const Models = ({ modelVals, totalCount }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [models, setModels] = useState([]);
  const [totalModels, setTotalModels] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setModels(modelVals);
    setTotalModels(totalCount);
    setIsLoading(false);
  }, [modelVals, totalCount]);

  const executeSearch = async () => {
    setIsLoading(true);
    const { data, totalCount } = await fetchModelsPaginated({
      tableName: "combinedModelsData",
      pageSize,
      currentPage: 1,
      searchValue: searchTerm,
    });
    setModels(data);
    setTotalModels(totalCount || 0);
    setCurrentPage(1);
    setIsLoading(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      executeSearch();
    }
  };

  const handlePageChange = async (page) => {
    setIsLoading(true);
    setCurrentPage(page);
    const { data } = await fetchModelsPaginated({
      tableName: "combinedModelsData",
      pageSize,
      currentPage: page,
      searchValue: searchTerm,
    });
    setModels(data);
    setIsLoading(false);
  };

  return (
    <>
      <MetaTags
        title={"AIModels.fyi | All Models"}
        description={"List of all AI models."}
      />
      <Container maxW="5xl">
        <Heading as="h1" mt={5}>
          Models
        </Heading>
        <Text mt={5}>Search through the list of amazing models below!</Text>
        <InputGroup mt={5}>
          <Input
            variant="outline"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by model name"
          />
          <Button ml={3} onClick={executeSearch} colorScheme="blue">
            Search
          </Button>
        </InputGroup>
      </Container>
      <Container maxW="8xl">
        <Flex wrap="wrap" justify="center" mt={10}>
          {isLoading
            ? Array.from({ length: pageSize }).map((_, index) => (
                <Box m={3} w="280px" key={index}>
                  <Skeleton height="200px" />
                  <Skeleton height="20px" mt={2} />
                  <Skeleton height="20px" mt={1} />
                </Box>
              ))
            : models.map((model) => (
                <Box m={3} w="280px" key={model.id}>
                  <ModelCard model={model} />
                </Box>
              ))}
        </Flex>
      </Container>
      <Center my={5}>
        <Pagination
          currentPage={currentPage}
          totalCount={totalModels}
          onPageChange={handlePageChange}
          pageSize={pageSize}
        />
      </Center>
    </>
  );
};

export default Models;
