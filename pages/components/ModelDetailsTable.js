import {
  Box,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  HStack,
  Icon,
  VStack,
  Text,
  TableContainer,
  Heading,
  Tag,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

const ModelDetailsTable = ({ model }) => {
  const trophyIcon = (rank) => {
    if (rank === 1) {
      return " 🥇";
    } else if (rank === 2) {
      return " 🥈";
    } else if (rank === 3) {
      return " 🥉";
    } else {
      return null;
    }
  };

  return (
    <VStack spacing={5} alignItems="start">
      <Heading as="h3" size="sm">
        Overview
      </Heading>
      <Text>Summary of this model and related resources.</Text>
      <Table
        size="sm"
        variant="simple"
        fullWidth
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
            <Td>Creator</Td>
            <Td>
              <Link
                href={`/creator/${model?.creator}`}
                color="blue.500"
                textDecoration="underline"
              >
                {model?.creator}
              </Link>
            </Td>
          </Tr>
          <Tr>
            <Td>Model Name</Td>
            <Td>{model?.modelName}</Td>
          </Tr>
          <Tr>
            <Td>Description</Td>
            <Td>
              {model?.description
                ? model?.description
                : "No description provided"}
            </Td>
          </Tr>
          <Tr>
            <Td>Tags</Td>
            <Td>
              <Tag colorScheme="teal">{model?.tags}</Tag>
            </Td>
          </Tr>
          <Tr>
            <Td>Demo Link</Td>
            <Td>
              <Link
                href={`https://replicate.com/${model?.creator}/${model?.modelName}/examples`}
                isExternal
                color="blue.500"
                textDecoration="underline"
              >
                View on Replicate <ExternalLinkIcon mx="2px" />
              </Link>
            </Td>
          </Tr>
          <Tr>
            <Td>API Spec</Td>
            <Td>
              <Link
                href={`https://replicate.com/${model?.creator}/${model?.modelName}/api`}
                isExternal
                color="blue.500"
                textDecoration="underline"
              >
                View on Replicate <ExternalLinkIcon mx="2px" />
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
          <Tr>
            <Td>Examples</Td>
            <Td>
              <Link
                href={`https://replicate.com/${model?.creator}/${model?.modelName}/examples`}
                isExternal
                color="blue.500"
                textDecoration="underline"
              >
                View on Replicate <ExternalLinkIcon mx="2px" />
              </Link>
            </Td>
          </Tr>
          <Tr>
            <Td>Versions</Td>
            <Td>
              <Link
                href={`https://replicate.com/${model?.creator}/${model?.modelName}/versions`}
                isExternal
                color="blue.500"
                textDecoration="underline"
              >
                View on Replicate <ExternalLinkIcon mx="2px" />
              </Link>
            </Td>
          </Tr>
        </Tbody>
      </Table>

      <Heading as="h3" size="sm">
        <Link href="/?tab=modelsLeaderboard">Popularity</Link>
      </Heading>
      <Text>
        How popular is this model, by number of runs? How popular is the
        creator, by the sum of all their runs?
      </Text>
      <Table
        size="sm"
        variant="simple"
        fullWidth
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
            <Td>Runs</Td>
            <Td>{model?.runs ? model?.runs?.toLocaleString() : 0}</Td>
          </Tr>
          <Tr>
            <Td>Model Rank</Td>
            <Td>
              {model?.modelRank} {trophyIcon(model?.modelRank)}
            </Td>
          </Tr>
          <Tr>
            <Td>Creator Rank</Td>
            <Td>
              {model?.creatorRank} {trophyIcon(model?.creatorRank)}
            </Td>
          </Tr>
        </Tbody>
      </Table>

      <Heading as="h3" size="sm">
        Cost
      </Heading>
      <Text>
        How much does it cost to run this model? How long, on average, does it
        take to complete a run?
      </Text>
      <Table
        size="sm"
        variant="simple"
        fullWidth
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
            <Td>Cost per Run</Td>
            <Td>{model?.costToRun ? `$${model?.costToRun}` : "$-"}</Td>
          </Tr>
          <Tr>
            <Td>Prediction Hardware</Td>
            <Td>{model?.predictionHardware || "-"}</Td>
          </Tr>
          <Tr>
            <Td>Average Completion Time</Td>
            <Td>
              {model?.avgCompletionTime
                ? `${model?.avgCompletionTime} seconds`
                : "-"}
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
};

export default ModelDetailsTable;
