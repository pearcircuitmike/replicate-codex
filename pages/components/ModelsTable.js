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
  useMediaQuery,
} from "@chakra-ui/react";
import PreviewImage from "./PreviewImage";

export default function ModelsTable(props) {
  const { data, searchValue, selectedTags, sorts } = props;

  const [isMobile] = useMediaQuery("(max-width: 480px)");

  const filteredData = data?.filter(
    (item) =>
      !selectedTags ||
      selectedTags?.length === 0 ||
      selectedTags?.includes(item.tags)
  );

  const sortedData = filteredData?.sort((a, b) => {
    for (const sort of sorts ?? []) {
      if (sort && a[sort.column] < b[sort.column]) {
        return sort.direction === "asc" ? -1 : 1;
      }
      if (sort && a[sort.column] > b[sort.column]) {
        return sort.direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  return (
    <Box>
      <TableContainer maxHeight="600px" overflowY="auto">
        <Table size="sm">
          <Thead position="sticky" top={0} bgColor="white">
            <Tr>
              {!isMobile && <Th>Creator</Th>}
              <Th>Model Name</Th>
              <Th>Description</Th>
              <Th>Example</Th>
              <Th>Tags</Th>
              <Th>Replicate URL</Th>
              <Th isNumeric>Runs</Th>
              <Th isNumeric>Cost</Th>
              <Th isNumeric>Last Updated</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedData
              ?.filter(
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
                  {!isMobile && (
                    <Td maxW={isMobile ? "120px" : "180px"} isTruncated>
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
                  )}
                  <Td maxW={isMobile ? "120px" : "180px"} isTruncated>
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
                    maxW={isMobile ? "120px" : "180px"}
                  >
                    {item.description}
                  </Td>
                  <Td maxW="64px">
                    <PreviewImage src={item.example} />
                  </Td>
                  <Td maxW="140px">
                    <Tag>{item.tags}</Tag>
                  </Td>
                  <Td
                    style={{ whiteSpace: "normal", wordWrap: "break-word" }}
                    maxW={isMobile ? "120px" : "180px"}
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
