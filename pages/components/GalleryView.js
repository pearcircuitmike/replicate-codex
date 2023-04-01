import * as React from "react";
import {
  Box,
  Checkbox,
  Heading,
  Image,
  Tag,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export default function GalleryView({
  data,
  searchValue,
  selectedTags,
  sorts,
}) {
  const filteredData = data?.filter(
    (item) =>
      !selectedTags ||
      selectedTags?.length === 0 ||
      selectedTags?.includes(item.tags)
  );

  const sortedData = filteredData?.sort((a, b) => {
    for (const sort of sorts ?? []) {
      if (sort && a[sort.column] < b[sort.column]) {
        return sort.direction === "asc" ? -1 : 1;
      }
      if (sort && a[sort.column] > b[sort.column]) {
        return sort.direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  return (
    <Box>
      <SimpleGrid columns={[2, null, 3]} minChildWidth="250px" gap={5}>
        {sortedData
          ?.filter(
            (row) =>
              typeof searchValue !== "undefined" &&
              ((row.modelName &&
                row.modelName
                  .toString()
                  .toLowerCase()
                  .includes(searchValue.toString().toLocaleLowerCase())) ||
                (row.creator &&
                  row.creator
                    .toString()
                    .toLowerCase()
                    .includes(searchValue.toString().toLocaleLowerCase())) ||
                (row.description &&
                  row.description
                    .toString()
                    .toLowerCase()
                    .includes(searchValue.toString().toLocaleLowerCase())) ||
                (row.tags &&
                  row.tags
                    .toString()
                    .toLowerCase()
                    .includes(searchValue.toString().toLocaleLowerCase())))
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
                borderColor="gray.200"
                backgroundColor="white"
                borderWidth="1px"
                borderRadius="2px"
                display="flex"
                flexDirection="column"
                height="100%"
                p={2}
              >
                <Box height="250px" m="1px">
                  <Link href={`/models/${id}`}>
                    <Image
                      src={
                        example
                          ? example
                          : "https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png"
                      }
                      alt="example"
                      width="100%"
                      maxW="240px"
                      maxH="240px"
                      margin="auto"
                      objectFit="cover"
                      objectPosition="center"
                    />
                  </Link>
                </Box>

                <Heading fontSize="lg" as="h2">
                  <a href={`/models/${id}`}>{modelName}</a>
                </Heading>

                <Text mt={1}>
                  <Tag colorScheme={"teal"}>{tags}</Tag>
                </Text>

                <Box height="80px" mt={1}>
                  <Text fontSize="sm" color={"gray.500"} noOfLines={3}>
                    {description}
                  </Text>
                </Box>

                <Text fontSize="sm">Runs: {runs.toLocaleString()}</Text>
                <Text fontSize="sm">
                  Cost to Run: ${costToRun ? costToRun.toLocaleString() : "-"}
                </Text>
                <Text fontSize="sm">
                  Creator:{" "}
                  <Link href={`/creators/${creator}`}>
                    <span
                      style={{ textDecoration: "underline", color: "teal" }}
                    >
                      {creator}
                    </span>
                  </Link>
                </Text>
                <Text fontSize="sm" color="gray.500">
                  <a href={modelUrl}>
                    <span
                      style={{ textDecoration: "underline", color: "teal" }}
                    >
                      Try on Replicate <ExternalLinkIcon />{" "}
                    </span>
                  </a>
                </Text>
              </Box>
            )
          )}
      </SimpleGrid>
    </Box>
  );
}
