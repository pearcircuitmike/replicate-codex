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

function ModelLeaderboard({ searchedVal }) {
  const models = testData;
  const sortedModels = models.sort((a, b) => b.runs - a.runs);

  return (
    <Box>
      <TableContainer maxHeight={600} overflowY="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Model Rank</Th>
              <Th>Runs</Th>
              <Th>Creator</Th>
              <Th>Model Name</Th>
              <Th>Example</Th>
              <Th>Cost to Run</Th>
              <Th>Description</Th>
              <Th>Replicate URL</Th>
              <Th>Last Updated</Th>
              <Th>Tags</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedModels
              .filter(
                (row) =>
                  !searchedVal.length ||
                  row.modelName
                    .toString()
                    .toLowerCase()
                    .includes(searchedVal.toString().toLocaleLowerCase()) ||
                  row.creator
                    .toString()
                    .toLowerCase()
                    .includes(searchedVal.toString().toLocaleLowerCase()) ||
                  row.description
                    .toString()
                    .toLowerCase()
                    .includes(searchedVal.toString().toLocaleLowerCase()) ||
                  row.tags
                    .toString()
                    .toLowerCase()
                    .includes(searchedVal.toString().toLocaleLowerCase())
              )
              .map((model, index) => (
                <Tr key={model.id}>
                  <Td isNumeric>
                    {index + 1 == "1" ? "🥇" : ""}
                    {index + 1 == "2" ? "🥈" : ""}
                    {index + 1 == "3" ? "🥉" : ""}
                    {index + 1}
                  </Td>
                  <Td isNumeric>{model.runs.toLocaleString()}</Td>
                  <Td maxWidth="200px" isTruncated>
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

                  <Td maxWidth="200px" isTruncated>
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
                  <Td>
                    <img
                      src={
                        model.example !== ""
                          ? model.example
                          : "https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png"
                      }
                      alt="example"
                      style={{
                        width: "32px",
                        height: "32px",
                        objectFit: "cover",
                      }}
                    />
                  </Td>
                  <Td isNumeric>${model.costToRun ? model.costToRun : "-"}</Td>

                  <Td>{model.description}</Td>
                  <Td maxWidth="200px" isTruncated>
                    <a
                      href={model.modelUrl}
                      target="_blank"
                      style={{
                        color: "teal",
                        textDecoration: "underline",
                      }}
                    >
                      {model.modelUrl}
                    </a>
                  </Td>

                  <Td>{model.lastUpdated}</Td>
                  <Td>
                    <Tag>{model.tags}</Tag>
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ModelLeaderboard;
