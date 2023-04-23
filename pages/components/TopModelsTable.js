import React from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Link } from "@chakra-ui/react";
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
      <Table variant="simple" size="md">
        <Thead>
          <Tr>
            <Th>Rank</Th>
            <Th>Name</Th>
            <Th>Runs</Th>
            <Th>Creator</Th>
          </Tr>
        </Thead>
        <Tbody>
          {models.map((model, index) => (
            <Tr key={model.id}>
              <Td>
                {medalEmoji(index + 1)}
                {index + 1}
              </Td>
              <Td>
                <Link to={`/models/${model.id}`}>{model.modelName}</Link>
              </Td>
              <Td>{formatNumber(model.runs)}</Td>
              <Td>
                <Link to={`/creators/${model.creator}`}>{model.creator}</Link>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export default TopModelsTable;
