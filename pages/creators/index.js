import {
  Container,
  Heading,
  Flex,
  Text,
  Box,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import Link from "next/link";
import Head from "next/head";
import MetaTags from "../components/MetaTags";
import PreviewImage from "../components/PreviewImage";

import React, { useState } from "react";

import testData from "../data/data.json";

export const getStaticProps = async () => {
  const data = testData;

  return {
    props: { creatorVals: data },
  };
};

const Creators = ({ creatorVals }) => {
  const [stateFilter, setStateFilter] = useState("");
  const handleSearch = (event) => setStateFilter(event.target.value);
  const uniqueCreators = [...new Set(creatorVals.map((item) => item.creator))];

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
          <InputRightElement mr={3}></InputRightElement>
        </InputGroup>

        <Flex wrap="wrap" justify="center" mt={10}>
          {uniqueCreators
            .filter((creatorVal) =>
              creatorVal.toLowerCase().includes(stateFilter.toLowerCase())
            )
            .map((creatorVal) => (
              <Box
                m={3}
                p={3}
                w="280px"
                h="280px"
                borderRadius="md"
                shadow="xl"
                bg="white"
                key={creatorVal}
              >
                <Flex align="center" direction="column" p={4}>
                  <Box w="150px" h="150px" objectFit="cover">
                    <PreviewImage
                      src={
                        creatorVals.find((c) => c.creator === creatorVal)
                          .example
                      }
                    />
                  </Box>
                  <Text mt={3} fontSize="xl" fontWeight="bold">
                    <Link href={`/creators/${creatorVal}`}>{creatorVal}</Link>
                  </Text>
                </Flex>
              </Box>
            ))}
        </Flex>
      </Container>
    </>
  );
};

export default Creators;
