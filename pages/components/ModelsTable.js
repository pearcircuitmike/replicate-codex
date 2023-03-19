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
} from "@chakra-ui/react";

export default function ModelsTable(props) {
  const { data, searchValue, selectedTags, sorts } = props;
  const filteredData = data.filter(
    (item) =>
      !selectedTags ||
      selectedTags.length === 0 ||
      selectedTags.includes(item.tags)
  );

  const sortedData = filteredData.sort((a, b) => {
    for (const sort of sorts ?? []) {
      if (a[sort.column] < b[sort.column]) {
        return sort.direction === "asc" ? -1 : 1;
      }
      if (a[sort.column] > b[sort.column]) {
        return sort.direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });
  return (
    <Box mt={5}>
      <TableContainer maxHeight="600px" mt="50px" overflowY="auto">
        <Table size="sm">
          <Thead position="sticky" top={0} bgColor="white">
            <Tr>
              <Th>Creator</Th>
              <Th>Model Name</Th>
              <Th>Description</Th>
              <Th>Tags</Th>
              <Th>Example</Th>
              <Th>Replicate URL</Th>
              <Th isNumeric>Runs</Th>
              <Th isNumeric>Cost</Th>
              <Th isNumeric>Last Updated</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedData
              .filter(
                (row) =>
                  typeof searchValue !== "undefined" &&
                  ((row.modelName &&
                    row.modelName
                      .toString()
                      .toLowerCase()
                      .includes(searchValue.toString().toLocaleLowerCase())) ||
                    (row.creator &&
                      row.creator
                        .toString()
                        .toLowerCase()
                        .includes(
                          searchValue.toString().toLocaleLowerCase()
                        )) ||
                    (row.description &&
                      row.description
                        .toString()
                        .toLowerCase()
                        .includes(
                          searchValue.toString().toLocaleLowerCase()
                        )) ||
                    (row.tags &&
                      row.tags
                        .toString()
                        .toLowerCase()
                        .includes(searchValue.toString().toLocaleLowerCase())))
              )
              .map((item) => (
                <Tr key={item.id} style={{ verticalAlign: "top" }}>
                  <Td maxW="150px" isTruncated>
                    <a
                      href={`/creators/${item.creator}`}
                      style={{
                        color: "teal",
                        textDecoration: "underline",
                      }}
                    >
                      {item.creator}
                    </a>
                  </Td>
                  <Td maxWidth="200px" isTruncated>
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
                    maxW="180px"
                  >
                    {item.description}
                  </Td>
                  <Td maxW="150px">
                    <Tag>{item.tags}</Tag>
                  </Td>
                  <Td>
                    <img
                      src={
                        item.example !== ""
                          ? item.example
                          : "https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png"
                      }
                      alt="example"
                      style={{
                        width: "64px",
                        height: "64px",
                        objectFit: "cover",
                      }}
                    />
                  </Td>
                  <Td
                    style={{ whiteSpace: "normal", wordWrap: "break-word" }}
                    maxW="180px"
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
    </Box>
  );
}
