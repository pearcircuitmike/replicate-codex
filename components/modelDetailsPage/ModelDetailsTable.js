import {
  Box,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Text,
  Heading,
  Tag,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

import TruncateWithReadMore from "@/components/TruncateWithReadMore";

import { getMedalEmoji } from "@/pages/api/utils/getMedalEmoji";
import { kebabToTitleCase } from "@/pages/api/utils/kebabToTitleCase";

const ModelDetailsTable = ({ model, creator }) => {
  return (
    <Box>
      <VStack spacing={5} alignItems="start">
        <Table
          size="sm"
          variant="simple"
          maxW="100%"
          border="1px"
          borderColor="gray.200"
        >
          <Thead>
            <Tr>
              <Th width="50%" bg="gray.200" color="gray.800">
                Property
              </Th>
              <Th width="50%" bg="gray.200" color="gray.800">
                Value
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Model Link</Td>
              <Td>
                <Link
                  href={model.modelUrl}
                  isExternal
                  color="blue.500"
                  textDecoration="underline"
                >
                  View on{" "}
                  {model.platform.charAt(0).toUpperCase() +
                    model.platform.slice(1)}{" "}
                  <ExternalLinkIcon mx="2px" />
                </Link>
              </Td>
            </Tr>
            <Tr>
              <Td>API Spec</Td>
              <Td>
                <Link
                  href={model.modelUrl}
                  isExternal
                  color="blue.500"
                  textDecoration="underline"
                >
                  View on{" "}
                  {model.platform.charAt(0).toUpperCase() +
                    model.platform.slice(1)}{" "}
                  <ExternalLinkIcon mx="2px" />
                </Link>
              </Td>
            </Tr>
            <Tr>
              <Td>Github Link</Td>
              <Td>
                {model?.githubUrl ? (
                  <Link
                    href={model?.githubUrl}
                    isExternal
                    color="blue.500"
                    textDecoration="underline"
                  >
                    View on Github <ExternalLinkIcon mx="2px" />
                  </Link>
                ) : (
                  "No Github link provided"
                )}
              </Td>
            </Tr>
            <Tr>
              <Td>Paper Link</Td>
              <Td>
                {model?.paperUrl ? (
                  <Link
                    href={model?.paperUrl}
                    isExternal
                    color="blue.500"
                    textDecoration="underline"
                  >
                    View on Arxiv <ExternalLinkIcon mx="2px" />
                  </Link>
                ) : (
                  "No paper link provided"
                )}
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </VStack>
    </Box>
  );
};

export default ModelDetailsTable;
