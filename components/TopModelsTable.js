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
import { formatLargeNumber } from "@/utils/formatLargeNumber";
import { getMedalEmoji } from "@/utils/getMedalEmoji";

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
                  {getMedalEmoji(index + 1)}
                  {index + 1}
                </Td>
                <Td isTruncated maxW="150px">
                  <a
                    href={`/models/${model?.platform}/${model?.id}`}
                    style={{
                      color: "teal",
                      textDecoration: "underline",
                    }}
                  >
                    {model.modelName}
                  </a>
                </Td>
                <Td>{formatLargeNumber(model.runs)}</Td>
                <Td>
                  <a
                    href={`/creators/${model.platform}/${model.creator}`}
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
