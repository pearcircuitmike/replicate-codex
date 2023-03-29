// components/CreatorModelsTable.js
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  HStack,
  Icon,
  Heading,
  TableContainer,
} from "@chakra-ui/react";
import { User } from "@chakra-ui/icons";

const CreatorModelsTable = ({ creatorModels }) => {
  return (
    <>
      <Box>
        <HStack>
          <Icon as={User} />
          <Heading as="h2" size="md">
            Creator's Models
          </Heading>
        </HStack>
        <TableContainer mt={5} mb={5}>
          <Table variant="striped" size="sm">
            <Thead>
              <Tr>
                <Th>Model</Th>

                <Th>Cost</Th>
                <Th>Runs</Th>
              </Tr>
            </Thead>
            <Tbody>
              {creatorModels?.length ? (
                creatorModels?.map((model) => (
                  <Tr key={model.id}>
                    <Td>
                      <Link href={`/models/${model.id}`}>
                        {model.modelName}
                      </Link>
                    </Td>

                    <Td>${model.costToRun ? model.costToRun : "?"}</Td>
                    <Td>{model.runs.toLocaleString()}</Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan="4">No other models by this creator</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default CreatorModelsTable;
