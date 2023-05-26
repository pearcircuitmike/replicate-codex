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
  VStack,
} from "@chakra-ui/react";

import { ExternalLinkIcon } from "@chakra-ui/icons";
import { AiOutlineUser } from "react-icons/ai";

const CreatorModelsTable = ({ creatorModels }) => {
  const maxToShow = 5;
  const displayedModels = creatorModels?.slice(0, maxToShow);

  return (
    <VStack spacing={4} alignItems="start">
      <HStack>
        <Heading as="h2" size="md">
          <Icon as={AiOutlineUser} boxSize={4} /> Creator Models
        </Heading>
      </HStack>

      <Table variant="striped" size="sm" border="1px" borderColor="gray.200">
        <Thead>
          <Tr>
            <Th isTruncated maxWidth="50%">
              Model
            </Th>
            <Th>Cost</Th>
            <Th>Runs</Th>
          </Tr>
        </Thead>
        <Tbody>
          {displayedModels?.length ? (
            displayedModels?.map((model) => (
              <Tr key={model.id}>
                <Td>
                  <Link href={`/models/${model?.platform}/${model?.id}`}>
                    {model.modelName}
                  </Link>
                </Td>

                <Td isTruncated>${model.costToRun ? model.costToRun : "?"}</Td>
                <Td isTruncated>{model.runs?.toLocaleString()}</Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan="4">No other models by this creator</Td>
            </Tr>
          )}
        </Tbody>
      </Table>
      {creatorModels?.length > maxToShow && (
        <Link
          href={`/${creatorModels[0]?.platform}/${creatorModels[0]?.creator}`}
          textDecoration="underline"
          color="blue.500"
        >
          View more
        </Link>
      )}
    </VStack>
  );
};

export default CreatorModelsTable;
