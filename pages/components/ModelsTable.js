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
  Skeleton,
} from "@chakra-ui/react";
import Pagination from "./Pagination";

import PreviewImage from "./PreviewImage";

export default function ModelsTable(props) {
  const {
    fetchFilteredData,
    currentPage,
    setCurrentPage,
    searchValue,
    selectedTags,
    sorts,
  } = props;

  const [isMobile] = useMediaQuery("(max-width: 480px)");
  const [totalCount, setTotalCount] = useState(0);

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // Destructure both data and totalCount from the result
      const { data, totalCount } = await fetchFilteredData({
        tableName: "modelsData",
        tags: selectedTags,
        searchValue,
        sorts,
        pageSize: 10,
        currentPage,
      });
      setFilteredData(data);
      setTotalCount(totalCount || 0); // Use totalCount or default to 0 if undefined
    }
    fetchData();
  }, [fetchFilteredData, searchValue, selectedTags, sorts, currentPage]);

  // set current page to 1 when a value changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTags, sorts, searchValue]);

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
                    <Skeleton isLoaded={item}>
                      <a
                        href={`/creators/${item.creator}`}
                        style={{
                          color: "teal",
                          textDecoration: "underline",
                        }}
                      >
                        {item.creator}
                      </a>
                    </Skeleton>
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
      <Pagination
        totalCount={totalCount}
        pageSize={10}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </Box>
  );
}
