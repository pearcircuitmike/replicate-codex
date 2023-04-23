import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  Box,
  TableContainer,
} from "@chakra-ui/react";
import ActiveTagFilters from "./tableControls/ActiveTagFilters";

function formatNumber(number) {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K";
  } else {
    return number.toString();
  }
}

const medalEmoji = (rank) => {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return "";
  }
};

const TopModelsTable = ({ models, selectedTags, onTagClose, onTagsChange }) => {
  return (
    <>
      <ActiveTagFilters
        tags={selectedTags}
        onTagClose={onTagClose}
        onTagsChange={onTagsChange}
      />
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Rank</Th>
              <Th>Name</Th>
              <Th>Runs</Th>
              <Th>Creator</Th>
            </Tr>
          </Thead>
          <Tbody>
            {models?.map((model, index) => (
              <Tr key={model.id}>
                <Td>
                  {medalEmoji(index + 1)}
                  {index + 1}
                </Td>
                <Td isTruncated maxW="150px">
                  <a
                    href={`/models/${model.id}`}
                    style={{
                      color: "teal",
                      textDecoration: "underline",
                    }}
                  >
                    {model.modelName}
                  </a>
                </Td>
                <Td>{formatNumber(model.runs)}</Td>
                <Td>
                  <a
                    href={`/creators/${model.creator}`}
                    style={{
                      color: "teal",
                      textDecoration: "underline",
                    }}
                  >
                    {model.creator}
                  </a>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

export default TopModelsTable;
