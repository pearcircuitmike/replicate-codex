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
  Checkbox,
} from "@chakra-ui/react";
import Link from "next/link";
import { colors } from "../../styles/colors";
import { ExternalLinkIcon } from "@chakra-ui/icons";

import testData from "../data/data.json";

export default function GalleryView({ searchedVal }) {
  const data = testData;

  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState({ field: "", direction: "" });
  const [selectedTags, setSelectedTags] = useState([]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleSortChange = (field) => {
    if (sort.field === field) {
      setSort({
        ...sort,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSort({ field, direction: "asc" });
    }
  };

  const handleTagSelect = (event) => {
    const tagName = event.target.value;
    const checked = event.target.checked;
    if (checked) {
      setSelectedTags([...selectedTags, tagName]);
    } else {
      setSelectedTags(selectedTags.filter((tags) => tags !== tagName));
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.tags.toLowerCase().includes(filter.toLowerCase()) &&
      (selectedTags.length === 0 || selectedTags.includes(item.tags))
  );

  const sortedData = filteredData.sort((a, b) => {
    if (a[sort.field] < b[sort.field]) {
      return sort.direction === "asc" ? -1 : 1;
    }
    if (a[sort.field] > b[sort.field]) {
      return sort.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const models = Array.from(new Set(data.map((item) => item.tags)));

  return (
    <>
      <Box mt="5px" mb="15px">
        {models.map((tags) => (
          <Checkbox
            mr="20px"
            value={tags}
            isChecked={selectedTags.includes(tags)}
            onChange={handleTagSelect}
            color="gray.600"
            key={models.id}
          >
            {tags}
          </Checkbox>
        ))}
      </Box>
      <SimpleGrid columns={[2, null, 3]} minChildWidth="250px" gap={5}>
        {sortedData &&
          sortedData
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
                    <Link href={`/models/${id}`}>
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
                    Cost to Run: $
                    {costToRun !== "" ? costToRun.toLocaleString() : "-"}
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
                  <Text fontSize="sm" color={colors.grey}>
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
    </>
  );
}
