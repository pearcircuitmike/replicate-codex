import React from "react";
import {
  Box,
  Image,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  TableContainer,
  Tag,
} from "@chakra-ui/react";
import testData from "../data/data.json";

function CreatorsLeaderboard({ searchedVal }) {
  const creators = testData.reduce((acc, cur) => {
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
            {sortedCreators
              .filter(
                ([_, creator]) =>
                  typeof searchedVal !== "undefined" &&
                  (creator.models.some(
                    (model) =>
                      model.modelName &&
                      model.modelName
                        .toString()
                        .toLowerCase()
                        .includes(searchedVal.toString().toLowerCase())
                  ) ||
                    creator.runs
                      .toString()
                      .toLowerCase()
                      .includes(searchedVal.toString().toLowerCase()) ||
                    creator.models.some(
                      (model) =>
                        model.description &&
                        model.description
                          .toString()
                          .toLowerCase()
                          .includes(searchedVal.toString().toLowerCase())
                    ) ||
                    creator.models.some(
                      (model) =>
                        model.tags &&
                        model.tags
                          .toString()
                          .toLowerCase()
                          .includes(searchedVal.toString().toLowerCase())
                    ) ||
                    creator.models.some(
                      (model) =>
                        model.creator &&
                        model.creator
                          .toString()
                          .toLowerCase()
                          .includes(searchedVal.toString().toLowerCase())
                    ))
              )
              .map(([creator, data], index) => (
                <Tr key={creator}>
                  <Td isNumeric>
                    {index + 1 == "1" ? "🥇" : ""}
                    {index + 1 == "2" ? "🥈" : ""}
                    {index + 1 == "3" ? "🥉" : ""}
                    {index + 1}
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
              ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default CreatorsLeaderboard;
