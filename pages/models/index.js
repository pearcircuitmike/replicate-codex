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
} from "@chakra-ui/react";
import Head from "next/head";
import MetaTags from "../components/MetaTags";
import ModelCard from "../components/ModelCard";
import Pagination from "../components/Pagination";
import { fetchDataWithPagination } from "../../utils/fetchModels";

const pageSize = 12;

export async function getStaticProps() {
  const { data, totalCount } = await fetchDataWithPagination({
    tableName: "modelsData",
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
  const [stateFilter, setStateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = async (event) => {
    setStateFilter(event.target.value);
    setCurrentPage(1);
    const { data, totalCount } = await fetchDataWithPagination({
      tableName: "modelsData",
      pageSize,
      currentPage: 1,
      searchValue: event.target.value,
    });
    setModelVals(data);
    setTotalCount(totalCount || 1);
  };

  console.log(totalCount);

  const [totalModels, setTotalCount] = useState(totalCount);
  const [models, setModelVals] = useState(modelVals);

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    const { data } = await fetchDataWithPagination({
      tableName: "modelsData",
      pageSize,
      currentPage: page,
      searchValue: stateFilter,
    });
    setModelVals(data);
  };

  return (
    <>
      <MetaTags
        title={"Replicate Codex | All Models"}
        description={"List of all AI models on the Replicate platform."}
      />
      <Container maxW="5xl">
        <Heading as="h1" mt={5}>
          Models
        </Heading>
        <Text mt={5}>Search through the list of amazing models below!</Text>

        <InputGroup mt={5}>
          <Input
            variant="outline"
            value={stateFilter}
            onChange={handleSearch}
            placeholder="Search by model name, creator, tag, or description"
          />
        </InputGroup>
      </Container>

      <Container maxW="8xl">
        <Flex wrap="wrap" justify="center" mt={10}>
          {models.map((modelVal) => (
            <Box m={3} w="280px" key={modelVal.id}>
              <ModelCard model={modelVal} />
            </Box>
          ))}
        </Flex>
      </Container>

      <Center my={5}>
        <Pagination
          currentPage={currentPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          pageSize={20}
        />
      </Center>
    </>
  );
};

export default Models;
