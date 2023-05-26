import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  TableContainer,
} from "@chakra-ui/react";
import { fetchCreators } from "../utils/fetchCreatorsPaginated";
import Pagination from "./Pagination";

function CreatorsLeaderboard({ searchValue }) {
  const [creatorsData, setCreatorsData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of creators to display per page

  useEffect(() => {
    async function fetchData() {
      const { data, totalCount } = await fetchCreators({
        viewName: "unique_creators_with_runs", // Update this to match your view name
        pageSize,
        currentPage,
        searchValue,
      });
      setCreatorsData(data);
      setTotalCount(totalCount);
    }
    fetchData();
  }, [searchValue, currentPage]);

  // set current page to 1 when a value changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  return (
    <Box>
      <TableContainer maxHeight={600} overflowY="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Rank</Th>
              <Th>Total Runs</Th>
              <Th>Creator</Th>
            </Tr>
          </Thead>
          <Tbody>
            {creatorsData.map((creatorData) => (
              <Tr key={creatorData.creator}>
                <Td isNumeric>
                  {creatorData.rank === 1 ? "🥇" : ""}
                  {creatorData.rank === 2 ? "🥈" : ""}
                  {creatorData.rank === 3 ? "🥉" : ""}
                  {creatorData.rank}
                </Td>
                <Td isNumeric>{creatorData.total_runs.toLocaleString()}</Td>
                <Td maxWidth="200px" isTruncated>
                  <a
                    href={`/creators/${creatorData.platform}/${creatorData.creator}`}
                    style={{
                      color: "teal",
                      textDecoration: "underline",
                    }}
                  >
                    {creatorData.creator}
                  </a>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Pagination
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </Box>
  );
}

export default CreatorsLeaderboard;
