import {
  Container,
  Heading,
  Flex,
  Text,
  Box,
  Spacer,
  Button,
  Center,
  Input,
  InputGroup,
  InputRightElement,
  Tooltip,
} from "@chakra-ui/react";
import Link from "next/link";

import React, { useState } from "react";
import { colors } from "../../styles/colors.js";
import testData from "../data/data.json";

export const getStaticProps = async () => {
  const data = testData;
  console.log(data);

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
      <Container maxW="5xl">
        <Heading as="h1" mt={5}>
          Creators
        </Heading>

        <Text size="md">Lorem ispum.</Text>

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
              <Link href={`creators/${creatorVal}`} key={creatorVal}>
                <Box
                  as="button"
                  m={3}
                  p={3}
                  w="280px"
                  h="280px"
                  borderRadius="md"
                  shadow="xl"
                  bg="white"
                >
                  <Flex align="center" direction="column" p={4}>
                    {creatorVals.find((c) => c.creator === creatorVal)
                      .example ? (
                      <Box
                        as="img"
                        src={
                          creatorVals.find((c) => c.creator === creatorVal)
                            .example
                        }
                        alt="creator"
                        w="150px"
                        h="150px"
                        objectFit="cover"
                        borderRadius="full"
                      />
                    ) : (
                      <Box
                        as="img"
                        src={"/default-creator.jpg"}
                        alt="creator"
                        w="150px"
                        h="150px"
                        objectFit="cover"
                        borderRadius="full"
                      />
                    )}
                    <Text mt={3} fontSize="xl" fontWeight="bold">
                      {creatorVal}
                    </Text>
                  </Flex>
                </Box>
              </Link>
            ))}
        </Flex>
      </Container>
    </>
  );
};

export default Creators;
