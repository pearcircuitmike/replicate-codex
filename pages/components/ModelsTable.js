import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Tag,
  useMediaQuery,
} from "@chakra-ui/react";
import PreviewImage from "./PreviewImage";

export default function ModelsTable(props) {
  const { data, searchValue, selectedTags, sorts } = props;

  const [isMobile] = useMediaQuery("(max-width: 480px)");

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const newFilteredData = data?.filter((item) => {
      const hasTag =
        !selectedTags ||
        selectedTags?.length === 0 ||
        selectedTags?.some((tag) => item.tags.includes(tag));

      const hasSearchValue =
        typeof searchValue !== "undefined" &&
        (item.modelName
          ?.toString()
          .toLowerCase()
          .includes(searchValue.toString().toLocaleLowerCase()) ||
          item.creator
            ?.toString()
            .toLowerCase()
            .includes(searchValue.toString().toLocaleLowerCase()) ||
          item.description
            ?.toString()
            .toLowerCase()
            .includes(searchValue.toString().toLocaleLowerCase()) ||
          item.tags
            ?.toString()
            .toLowerCase()
            .includes(searchValue.toString().toLocaleLowerCase()));

      return hasTag && hasSearchValue;
    });

    const newSortedData = newFilteredData?.sort((a, b) => {
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

    setFilteredData(newSortedData);
  }, [data, searchValue, selectedTags, sorts]);

  return (
    <Box>
      <TableContainer maxHeight="600px" overflowY="auto">
        <Table size="sm">
          <Thead position="sticky" top={0} bgColor="white">
            <Tr>
              {!isMobile && <Th>Creator</Th>}
              <Th>Model Name</Th>
              <Th>Description</Th>
              <Th>Example</Th>
              <Th>Tags</Th>
              <Th>Replicate URL</Th>
              <Th isNumeric>Runs</Th>
              <Th isNumeric>Cost</Th>
              <Th isNumeric>Last Updated</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredData?.map((item) => (
              <Tr key={item.id} style={{ verticalAlign: "top" }}>
                {!isMobile && (
                  <Td maxW={isMobile ? "120px" : "180px"} isTruncated>
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
                )}
                <Td maxW={isMobile ? "120px" : "180px"} isTruncated>
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
                  maxW={isMobile ? "120px" : "180px"}
                >
                  {item.description}
                </Td>
                <Td maxW="64px">
                  <PreviewImage src={item.example ? item.example : ""} />
                </Td>
                <Td maxW="140px">
                  <Tag>{item.tags}</Tag>
                </Td>
                <Td
                  style={{ whiteSpace: "normal", wordWrap: "break-word" }}
                  maxW={isMobile ? "120px" : "180px"}
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
