import React, { useState } from "react";
import testData from "../data/data.json";
import {
  Box,
  Checkbox,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Tag,
  HStack,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";

export default function TableTest({ searchedVal }) {
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
    <Box>
      <Box mt="5px" mb="15px">
        {models.map((tags) => (
          <Checkbox
            mr="20px"
            value={tags}
            isChecked={selectedTags.includes(tags)}
            onChange={handleTagSelect}
            color="gray.600"
            key={models.tags}
          >
            {tags}
          </Checkbox>
        ))}
      </Box>

      <TableContainer maxHeight={600} overflowY="auto">
        <Table size="sm">
          <Thead position="sticky" top={0} bgColor="white">
            <Tr>
              <Th onClick={() => handleSortChange("creator")}>
                Creator
                {sort.field === "creator" &&
                  (sort.direction === "asc" ? "▲" : "▼")}
              </Th>
              <Th onClick={() => handleSortChange("modelName")}>
                Model
                {sort.field === "modelName" &&
                  (sort.direction === "asc" ? "▲" : "▼")}
              </Th>
              <Th onClick={() => handleSortChange("description")}>
                Description
                {sort.field === "description" &&
                  (sort.direction === "asc" ? "▲" : "▼")}
              </Th>
              <Th onClick={() => handleSortChange("tags")}>
                Tags
                {sort.field === "tags" &&
                  (sort.direction === "asc" ? "▲" : "▼")}
              </Th>

              <Th onClick={() => handleSortChange("example")}>
                Example
                {sort.field === "example" &&
                  (sort.direction === "asc" ? "▲" : "▼")}
              </Th>
              <Th onClick={() => handleSortChange("modelUrl")}>
                Replicate URL
                {sort.field === "modelUrl" &&
                  (sort.direction === "asc" ? "▲" : "▼")}
              </Th>
              <Th onClick={() => handleSortChange("runs")}>
                Runs
                {sort.field === "runs" &&
                  (sort.direction === "asc" ? "▲" : "▼")}
              </Th>
              <Th onClick={() => handleSortChange("costToRun")}>
                Cost
                {sort.field === "costToRun" &&
                  (sort.direction === "asc" ? "▲" : "▼")}
              </Th>
              <Th onClick={() => handleSortChange("lastUpdated")}>
                Last Updated
                {sort.field === "lastUpdated" &&
                  (sort.direction === "asc" ? "▲" : "▼")}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedData
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
                        .includes(
                          searchedVal.toString().toLocaleLowerCase()
                        )) ||
                    (row.description &&
                      row.description
                        .toString()
                        .toLowerCase()
                        .includes(
                          searchedVal.toString().toLocaleLowerCase()
                        )) ||
                    (row.tags &&
                      row.tags
                        .toString()
                        .toLowerCase()
                        .includes(searchedVal.toString().toLocaleLowerCase())))
              )
              .map((item) => (
                <Tr key={item.id} style={{ verticalAlign: "top" }}>
                  <Td maxW="150px" isTruncated>
                    <a
                      href={`/creators/${item.creator}`}
                      style={{
                        color: "teal",
                        textDecoration: "underline",
                      }}
                    >
                      {item.creator}
                    </a>
                  </Td>
                  <Td maxWidth="200px" isTruncated>
                    <a
                      href={`/models/${item.id}`}
                      style={{
                        color: "teal",
                        textDecoration: "underline",
                      }}
                    >
                      {item.modelName}
                    </a>
                  </Td>
                  <Td
                    style={{ whiteSpace: "normal", wordWrap: "break-word" }}
                    maxW="180px"
                  >
                    {item.description}
                  </Td>
                  <Td maxW="150px">
                    <Tag>{item.tags}</Tag>
                  </Td>
                  <Td>
                    <img
                      src={
                        item.example !== ""
                          ? item.example
                          : "https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png"
                      }
                      alt="example"
                      style={{
                        width: "64px",
                        height: "64px",
                        objectFit: "cover",
                      }}
                    />
                  </Td>
                  <Td
                    style={{ whiteSpace: "normal", wordWrap: "break-word" }}
                    maxW="180px"
                  >
                    <a
                      href={item.modelUrl}
                      style={{
                        color: "teal",
                        textDecoration: "underline",
                      }}
                    >
                      {item.modelUrl}
                    </a>
                  </Td>
                  <Td isNumeric>{item.runs.toLocaleString()}</Td>
                  <Td isNumeric>${item.costToRun ? item.costToRun : "-"}</Td>
                  <Td isNumeric>{item.lastUpdated}</Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}
