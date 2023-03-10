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

  return (
    <>
      <Container maxW="5xl">
        <Heading as="h1" mt={5}>
          Creators
        </Heading>

        <Text size="md">Lorem ispum.</Text>

        <Text mt={5}>something</Text>

        <ul>
          {creatorVals.map((creatorVal) => (
            <li key={creatorVal.id}>
              <Link href={`creators/${creatorVal.creator}`}>
                {creatorVal.creator}
              </Link>
            </li>
          ))}
        </ul>

        <InputGroup mt={5}>
          <Input
            variant="outline"
            value={stateFilter}
            onChange={handleSearch}
            placeholder="Search by state name"
          />
          <InputRightElement mr={3}></InputRightElement>
        </InputGroup>
      </Container>
    </>
  );
};

export default Creators;
