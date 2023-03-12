import * as React from "react";
import { useState, useEffect } from "react";
import {
  Stack,
  Box,
  Heading,
  Image,
  Text,
  Tag,
  Center,
  Textarea,
  Input,
  Grid,
  SimpleGrid,
} from "@chakra-ui/react";
import Link from "next/link";
import { colors } from "../../styles/colors";

import testData from "../data/data.json";

export default function GalleryView({ searchedVal }) {
  const data = testData;

  return (
    <>
      <SimpleGrid columns={[2, null, 3]} minChildWidth="250px" gap={5}>
        {data &&
          data
            .filter(
              (row) =>
                typeof searchedVal !== "undefined" &&
                ((row.modelName &&
                  row.modelName
                    .toString()
                    .toLowerCase()
                    .includes(searchedVal.toString().toLocaleLowerCase())) ||
                  (row.creator &&
                    row.creator
                      .toString()
                      .toLowerCase()
                      .includes(searchedVal.toString().toLocaleLowerCase())) ||
                  (row.description &&
                    row.description
                      .toString()
                      .toLowerCase()
                      .includes(searchedVal.toString().toLocaleLowerCase())) ||
                  (row.tags &&
                    row.tags
                      .toString()
                      .toLowerCase()
                      .includes(searchedVal.toString().toLocaleLowerCase())))
            )
            .map(
              ({
                creator,
                modelName,
                description,
                tags,
                example,
                modelUrl,
                runs,
                costToRun,
                id,
                lastUpdated,
              }) => (
                <Box
                  key={id}
                  borderColor={colors.grey}
                  backgroundColor="white"
                  borderWidth="1px"
                  borderRadius="2px"
                  display="flex"
                  flexDirection="column"
                  height="100%"
                  p={2}
                >
                  <Box height="250px" m="1px">
                    <Link href={modelUrl}>
                      <Image
                        src={
                          example !== ""
                            ? example
                            : "https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png"
                        }
                        alt="example"
                        width="100%"
                        maxW="240px"
                        maxH="240px"
                        margin="auto"
                      />
                    </Link>
                  </Box>
                  <Heading fontSize="md" as="h2">
                    {modelName}
                  </Heading>
                  <Text fontSize="sm" color={colors.grey}>
                    {description}
                  </Text>
                  <Stack isInline align="center" spacing={3}>
                    <Tag>{tags}</Tag>
                  </Stack>

                  <Text fontSize="sm" color={colors.grey}>
                    Runs: {runs.toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color={colors.grey}>
                    Cost to Run: $
                    {costToRun !== "" ? costToRun.toLocaleString() : "-"}
                  </Text>
                  <Text fontSize="sm" color={colors.grey}>
                    Creator:{" "}
                    <Link href={`/creators/${creator}`}>
                      <span
                        style={{ textDecoration: "underline", color: "teal" }}
                      >
                        {" "}
                        {creator}
                      </span>
                    </Link>
                  </Text>
                </Box>
              )
            )}
      </SimpleGrid>
    </>
  );
}
