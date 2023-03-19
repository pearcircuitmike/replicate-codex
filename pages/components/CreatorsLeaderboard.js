import React from "react";
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

function getCreatorRank(creatorName, sortedCreators) {
  return sortedCreators.findIndex(([name]) => name === creatorName) + 1;
}

function CreatorsLeaderboard({ data, searchValue }) {
  if (!data) {
    return null;
  }

  const creators = data.reduce((acc, cur) => {
    const creator = cur.creator;
    const runs = cur.runs;

    if (!acc[creator]) {
      acc[creator] = {
        runs: runs,
        models: [cur],
      };
    } else {
      acc[creator].runs += runs;
      acc[creator].models.push(cur);
    }

    return acc;
  }, {});

  const sortedCreators = Object.entries(creators).sort(
    ([_, a], [__, b]) => b.runs - a.runs
  );

  const filteredCreators = sortedCreators.filter(([creatorName, creator]) => {
    const searchMatch =
      typeof searchValue === "undefined" ||
      creatorName
        .toString()
        .toLowerCase()
        .includes(searchValue.toString().toLowerCase());

    return searchMatch;
  });

  return (
    <Box>
      <TableContainer maxHeight={600} overflowY="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Creator Rank</Th>
              <Th>Total Runs</Th>
              <Th>Creator</Th>
              <Th>Total Models</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredCreators.map(([creator, data], index) => {
              const rank = getCreatorRank(creator, sortedCreators);
              return (
                <Tr key={creator}>
                  <Td isNumeric>
                    {rank === 1 ? "🥇" : ""}
                    {rank === 2 ? "🥈" : ""}
                    {rank === 3 ? "🥉" : ""}
                    {rank}
                  </Td>
                  <Td isNumeric>{data.runs.toLocaleString()}</Td>
                  <Td maxWidth="200px" isTruncated>
                    <a
                      href={`/creators/${creator}`}
                      style={{
                        color: "teal",
                        textDecoration: "underline",
                      }}
                    >
                      {creator}
                    </a>
                  </Td>
                  <Td isNumeric>{data.models.length}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default CreatorsLeaderboard;
