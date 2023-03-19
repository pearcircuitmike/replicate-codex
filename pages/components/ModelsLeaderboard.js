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
  Tag,
} from "@chakra-ui/react";
import testData from "../data/data.json";

function getRank(modelId, data) {
  const sortedData = [...data].sort((a, b) => b.runs - a.runs);
  const modelIndex = sortedData.findIndex((model) => model.id === modelId);
  return modelIndex + 1;
}

function ModelLeaderboard({ data, searchValue, selectedTags, sorts }) {
  const models = data || testData;
  const sortedModels = models.sort((a, b) => b.runs - a.runs);

  const filteredModels = models
    .filter((row) => {
      const searchMatch =
        typeof searchValue !== "undefined" &&
        ((row.modelName &&
          row.modelName
            .toString()
            .toLowerCase()
            .includes(searchValue.toString().toLowerCase())) ||
          (row.creator &&
            row.creator
              .toString()
              .toLowerCase()
              .includes(searchValue.toString().toLowerCase())) ||
          (row.description &&
            row.description
              .toString()
              .toLowerCase()
              .includes(searchValue.toString().toLowerCase())) ||
          (row.tags &&
            row.tags
              .toString()
              .toLowerCase()
              .includes(searchValue.toString().toLowerCase())));

      const tagsMatch =
        !selectedTags?.length ||
        (row.tags && row.tags.some((tag) => selectedTags?.includes(tag)));

      return searchMatch && tagsMatch;
    })
    .sort(sorts);

  return (
    <Box mt={5}>
      <TableContainer maxHeight={600} overflowY="auto" mt="50px">
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
            {filteredModels.map((model, index) => {
              const rank = getRank(model.id, models);
              return (
                <Tr key={model.id}>
                  <Td isNumeric>
                    {rank === 1 ? "🥇" : ""}
                    {rank === 2 ? "🥈" : ""}
                    {rank === 3 ? "🥉" : ""}
                    {rank}
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
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ModelLeaderboard;
