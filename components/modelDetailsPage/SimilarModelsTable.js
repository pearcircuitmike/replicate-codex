// SimilarModelsTable component
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
import { AiFillBulb } from "react-icons/ai";

const SimilarModelsTable = ({ similarModels }) => {
  return (
    <>
      <Box>
        <HStack>
          <Heading as="h2" size="md">
            <Icon as={AiFillBulb} boxSize={4} /> Similar Models
          </Heading>
        </HStack>
        <TableContainer my={5}>
          <Table
            variant="striped"
            size="sm"
            border="1px"
            borderColor="gray.200"
          >
            <Thead>
              <Tr>
                <Th>Model</Th>
              </Tr>
            </Thead>
            <Tbody>
              {similarModels?.length ? (
                similarModels?.map((model) => (
                  <Tr key={model.id}>
                    <Td>
                      <Link
                        href={`/models/${model?.platform}/${model?.id}`}
                        color="blue.500"
                      >
                        {model.modelName}
                      </Link>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td>No similar models found</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default SimilarModelsTable;
