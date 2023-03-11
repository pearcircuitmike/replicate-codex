import {
  Box,
  Container,
  Heading,
  Text,
  Badge,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Image,
  Link,
} from "@chakra-ui/react";
import data from "../data/data.json";

export default function Creator({ creator }) {
  const models = data.filter((model) => model.creator === creator);

  const avgCost =
    models
      .filter((model) => model.costToRun !== "") // Filters out models that have an empty string as the costToRun value
      .reduce((sum, model) => sum + model.costToRun, 0) / models.length;

  const modelTypes = {};
  models.forEach((model) => {
    if (model.tags in modelTypes) {
      modelTypes[model.tags]++;
    } else {
      modelTypes[model.tags] = 1;
    }
  });

  // calc rank
  function calculateCreatorRank(data, creator) {
    // Sort array in descending order based on runs
    const sortedData = data.sort((a, b) => b.runs - a.runs);

    let rank = 0;
    // Loop through sorted array and find the given creator's position
    for (let i = 0; i < sortedData.length; i++) {
      if (sortedData[i].creator === creator) {
        rank = i + 1; // Add 1 since rank starts at 1
        break;
      }
    }

    return rank;
  }

  return (
    <Container maxW="container.xl" py="12">
      <Box>
        <Heading as="h2" size="xl" mb="2">
          {creator}
          {calculateCreatorRank(data, creator) == 1 ? " 🥇" : ""}
          {calculateCreatorRank(data, creator) == 2 ? " 🥈" : ""}
          {calculateCreatorRank(data, creator) == 3 ? " 🥉" : ""}
        </Heading>
        Rank: {calculateCreatorRank(data, creator)}
        <Text fontSize="lg" color="gray.500">
          Average Model Cost: ${avgCost.toFixed(4)}
        </Text>
        <Text fontSize="lg" color="gray.500" mb="8">
          Number of Runs:{" "}
          {models.reduce((sum, model) => sum + model.runs, 0).toLocaleString()}
        </Text>
        <Table>
          <Thead>
            <Tr>
              <Th>Model Type</Th>
              <Th>Count</Th>
            </Tr>
          </Thead>
          <tbody>
            {Object.entries(modelTypes).map(([tag, count]) => (
              <Tr key={tag}>
                <Td>{tag}</Td>
                <Td>{count}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Box>

      <Box mt="12" display="flex" flexWrap="wrap">
        {models.map((model) => (
          <Box
            key={model.id}
            width={{ base: "100%", sm: "50%", md: "33%", lg: "25%" }}
            p="4"
          >
            <Link href={`/models/${model.id}`}>
              <Image
                src={
                  model.example !== ""
                    ? model.example
                    : "https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png"
                }
                alt="Model Preview"
                w="full"
                h="64"
                objectFit="cover"
                mb="4"
              />
            </Link>

            <Heading as="h3" size="lg" mb="2">
              {model.modelName}
            </Heading>
            <Text fontSize="lg" color="gray.500" mb="4">
              {model.description}
            </Text>
            <Badge colorScheme="teal" mb="4">
              {model.tags}
            </Badge>
            <Text fontSize="lg" mb="4">
              Cost/run: ${model.costToRun}
            </Text>
            <Text fontSize="lg" mb="4">
              Runs: {model.runs.toLocaleString()}
            </Text>
            <Text fontSize="lg" color="gray.500" mb="4">
              Last Updated: {model.lastUpdated}
            </Text>
          </Box>
        ))}
      </Box>
    </Container>
  );
}

export async function getStaticPaths() {
  const creators = Array.from(new Set(data.map((model) => model.creator)));
  const paths = creators.map((creator) => ({
    params: { creator: creator.toLowerCase() },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const creator = params.creator;

  const models = data.filter((model) => model.creator === creator);

  const avgCost =
    models.reduce((sum, model) => {
      if (model.costToRun) {
        return sum + model.costToRun;
      }
      return sum;
    }, 0) / models.filter((model) => model.costToRun).length;

  const modelTypes = {};
  models.forEach((model) => {
    if (model.tags in modelTypes) {
      modelTypes[model.tags]++;
    } else {
      modelTypes[model.tags] = 1;
    }
  });

  return { props: { creator, models, avgCost, modelTypes } };
}
