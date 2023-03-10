import React, { useState } from "react";
import {
  Container,
  Heading,
  Flex,
  Text,
  Box,
  Tag,
  Input,
  InputGroup,
  InputRightElement,
  Image,
} from "@chakra-ui/react";
import Link from "next/link";
import testData from "../data/data.json";
import Head from "next/head";
import MetaTags from "../components/MetaTags";

export const getStaticProps = async () => {
  const data = testData;

  return {
    props: { modelVals: data },
  };
};

const Models = ({ modelVals }) => {
  const [stateFilter, setStateFilter] = useState("");
  const handleSearch = (event) => setStateFilter(event.target.value);

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
            placeholder="Search by model name"
          />
          <InputRightElement mr={3}></InputRightElement>
        </InputGroup>

        <Flex wrap="wrap" justify="center" mt={10}>
          {modelVals
            .filter((modelVal) =>
              modelVal.modelName
                .toLowerCase()
                .includes(stateFilter.toLowerCase())
            )
            .map((modelVal) => (
              <Box
                m={3}
                p={3}
                w="280px"
                shadow="xl"
                bg="white"
                key={modelVal.id}
              >
                <Flex align="center" direction="column" p={4}>
                  <Image
                    src={
                      modelVal.example !== ""
                        ? modelVal.example
                        : "https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png"
                    }
                    alt="model"
                    w="150px"
                    h="150px"
                    objectFit="cover"
                  />

                  <Text mt={3} fontSize="xl" fontWeight="bold">
                    {modelVal.modelName}
                  </Text>

                  <Text>
                    <a
                      href={`/creators/${modelVal.creator}`}
                      style={{
                        color: "teal",
                        textDecoration: "underline",
                      }}
                    >
                      {modelVal.creator}
                    </a>
                  </Text>
                  <Text fontSize="sm" fontWeight="normal">
                    {modelVal.description}
                  </Text>
                  <Text fontSize="sm" fontWeight="normal">
                    Runs: {modelVal.runs.toLocaleString()}
                  </Text>
                  <Text fontSize="sm" fontWeight="normal">
                    Cost to run: ${modelVal.costToRun}
                  </Text>

                  <Tag>{modelVal.tags}</Tag>
                </Flex>
              </Box>
            ))}
        </Flex>
      </Container>
    </>
  );
};

export default Models;
