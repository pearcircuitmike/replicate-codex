import React from "react";
import { Box, Table, TableContainer, Tbody, Thead, Tr } from "@chakra-ui/react";
import useFetchData from "../hooks/useFetchData";
import Pagination from "./Pagination";
import TableRow from "./TableRow";

export default function ModelsTable(props) {
  const {
    fetchFilteredData,
    currentPage,
    setCurrentPage,
    searchValue,
    selectedTags,
    sorts,
  } = props;

  const { filteredData, totalCount } = useFetchData(
    fetchFilteredData,
    searchValue,
    selectedTags,
    sorts,
    currentPage,
    setCurrentPage
  );

  return (
    <Box>
      <TableContainer maxHeight="600px" overflowY="auto">
        <Table size="sm">
          <Thead position="sticky" top={0} bgColor="white">
            <Tr>
              <TableRow isHeader={true} />
            </Tr>
          </Thead>
          <Tbody>
            {filteredData?.map((item) => (
              <Tr key={item.id} style={{ verticalAlign: "top" }}>
                <TableRow item={item} />
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
