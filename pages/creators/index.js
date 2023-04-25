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
import MetaTags from "../../components/MetaTags";
import CreatorCard from "../../components/CreatorCard";
import Pagination from "../../components/Pagination";
import { fetchCreators } from "../../utils/fetchCreators";

const pageSize = 12;

export async function getStaticProps() {
  const { data, totalCount } = await fetchCreators({
    viewName: "unique_creators_with_runs",
    pageSize,
    currentPage: 1,
    searchValue: "",
  });

  return {
    props: { creatorVals: data, totalCount: totalCount || 0 },
    revalidate: 60,
  };
}

const Creators = ({ creatorVals, totalCount }) => {
  const [stateFilter, setStateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = async (event) => {
    setStateFilter(event.target.value);
    setCurrentPage(1);
    const { data, totalCount } = await fetchCreators({
      viewName: "unique_creators_with_runs",
      pageSize,
      currentPage: 1,
      searchValue: event.target.value,
    });
    setCreatorVals(data);
    setTotalCount(totalCount || 1);
  };

  const [totalCreators, setTotalCount] = useState(totalCount);
  const [creators, setCreatorVals] = useState(creatorVals);

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    const { data } = await fetchCreators({
      viewName: "unique_creators_with_runs",
      pageSize,
      currentPage: page,
      searchValue: stateFilter,
    });
    setCreatorVals(data);
  };

  return (
    <>
      <MetaTags
        title={"Replicate Codex | All Creators"}
        description={"Search AI model creators on the Replicate platform."}
      />
      <Container maxW="5xl">
        <Heading as="h1" mt={5}>
          Creators
        </Heading>
        <Text mt={5}>Search through the list of amazing creators below!</Text>

        <InputGroup mt={5}>
          <Input
            variant="outline"
            value={stateFilter}
            onChange={handleSearch}
            placeholder="Search by creator name"
          />
        </InputGroup>
      </Container>

      <Container maxW="8xl">
        <Flex wrap="wrap" justify="center" mt={10}>
          {creators.map((creator, index) => (
            <Box m={3} w="280px" key={index}>
              <CreatorCard creator={creator} />
            </Box>
          ))}
        </Flex>
      </Container>

      <Center my={5}>
        <Pagination
          currentPage={currentPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          pageSize={pageSize}
        />
      </Center>
    </>
  );
};

export default Creators;
