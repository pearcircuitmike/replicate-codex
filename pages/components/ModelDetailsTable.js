import {
  Box,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Link,
  HStack,
  Icon,
  VStack,
  Text,
  TableContainer,
  Heading,
  Tag,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { GiTrophyBronze, GiTrophySilver, GiTrophyGold } from "react-icons/gi";

const ModelDetailsTable = ({ model }) => {
  const trophyIcon = (rank) => {
    if (rank === 1) {
      return <Icon as={GiTrophyGold} />;
    } else if (rank === 2) {
      return <Icon as={GiTrophySilver} />;
    } else if (rank === 3) {
      return <Icon as={GiTrophyBronze} />;
    } else {
      return null;
    }
  };

  return (
    <VStack spacing={5} alignItems="start">
      <Heading as="h3" size="sm">
        Overview
      </Heading>
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
              <Tag>{model?.tags}</Tag>
            </Td>
          </Tr>
          <Tr>
            <Td>Demo Link</Td>
            <Td>
              {model?.demoUrl ? (
                <Link
                  href={model?.demoUrl}
                  isExternal
                  color="blue.500"
                  textDecoration="underline"
                >
                  View on Replicate <ExternalLinkIcon mx="2px" />
                </Link>
              ) : (
                "No demo link provided"
              )}
            </Td>
          </Tr>
          <Tr>
            <Td>API Spec</Td>
            <Td>
              {model?.apiSpecUrl ? (
                <Link
                  href={model?.apiSpecUrl}
                  isExternal
                  color="blue.500"
                  textDecoration="underline"
                >
                  View on Replicate <ExternalLinkIcon mx="2px" />
                </Link>
              ) : (
                "No API spec link provided"
              )}
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
              {model?.examplesUrl ? (
                <Link
                  href={model.examples}
                  isExternal
                  color="blue.500"
                  textDecoration="underline"
                >
                  View on Replicate <ExternalLinkIcon mx="2px" />
                </Link>
              ) : (
                "No examples link provided"
              )}
            </Td>
          </Tr>
          <Tr>
            <Td>Versions</Td>
            <Td>
              {model?.versionsUrl ? (
                <Link
                  href={model.versionsUrl}
                  isExternal
                  color="blue.500"
                  textDecoration="underline"
                >
                  View on Replicate <ExternalLinkIcon mx="2px" />
                </Link>
              ) : (
                "No versions link provided"
              )}
            </Td>
          </Tr>
        </Tbody>
      </Table>

      <Heading as="h3" size="sm">
        Popularity
      </Heading>
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
                ? `${(model?.avgCompletionTime / 60).toFixed(2)} minutes`
                : "-"}
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
};

export default ModelDetailsTable;
