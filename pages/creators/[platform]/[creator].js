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
import { fetchAllDataFromTable } from "../../../utils/modelsData.js";
import Head from "next/head";
import SimilarCreators from "../../../components/SimilarCreators";
import ShareLinkButton from "../../../components/ShareLinkButton";
import ShareTweetButton from "../../../components/ShareTweetButton";
import calculateCreatorRank from "../../../utils/calculateCreatorRank";
import PreviewImage from "../../../components/PreviewImage";
import MetaTags from "../../../components/MetaTags";

export async function getStaticPaths() {
  const platforms = ["replicate", "cerebrium", "deepInfra", "huggingFace"];
  const paths = [];

  for (const platform of platforms) {
    const modelsData = await fetchAllDataFromTable(`${platform}ModelsData`);
    const creators = Array.from(
      new Set(modelsData.map((model) => model.creator))
    );

    for (const creator of creators) {
      paths.push({ params: { creator: creator.toLowerCase(), platform } });
    }
  }

  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { creator, platform } = params;
  const allModelsData = await fetchAllDataFromTable(`${platform}ModelsData`);

  const models = allModelsData.filter((model) => model.creator === creator);

  return {
    props: { creator, models, allModels: allModelsData },
    revalidate: 60,
  };
}

export default function Creator({ creator, models, allModels, platform }) {
  const avgCost =
    models
      .filter((model) => model.costToRun !== "")
      .reduce((sum, model) => sum + model.costToRun, 0) / models.length;

  const modelTypes = {};
  models.forEach((model) => {
    const tags = model.tags ? model.tags : "";
    if (tags in modelTypes) {
      modelTypes[tags]++;
    } else {
      modelTypes[tags] = 1;
    }
  });
  function getSimilarCreators(creator) {
    const creatorModels = models;
    const creatorTags = creatorModels.flatMap((model) => {
      if (model.tags) {
        return model.tags.split(",");
      } else {
        return [];
      }
    });

    const similarCreators = allModels
      .filter((item) => item.creator.toLowerCase() !== creator.toLowerCase())
      .filter((item) => item.tags)
      .filter((item) => {
        const itemTags = item.tags.split(",");
        return itemTags.some((tag) => creatorTags.includes(tag));
      })
      .map((item) => item.creator);
    return [...new Set(similarCreators)];
  }

  const similarCreators = getSimilarCreators(creator);
  const rank = calculateCreatorRank(allModels, creator);

  return (
    <>
      <MetaTags
        title={`AI model creator details for ${creator}`}
        description={`Details about ${creator}'s account on Replicate and their AI models`}
      />

      <Container maxW="container.xl" py="12">
        <Heading as="h2" size="xl" mb="2">
          {creator}
          {rank == 1 ? " 🥇" : ""}
          {rank == 2 ? " 🥈" : ""}
          {rank == 3 ? " 🥉" : ""}
        </Heading>
        Rank: {calculateCreatorRank(allModels, creator)}
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
        <ShareLinkButton />
        <ShareTweetButton />
        <Box mt="12" display="flex" flexWrap="wrap">
          {models.map((model) => (
            <Box
              key={model.id}
              width={{ base: "100%", sm: "50%", md: "33%", lg: "25%" }}
              p="4"
            >
              <Box>
                <Link href={`/models/${model.platform}/${model.id}`}>
                  <PreviewImage src={model.example} />
                </Link>
              </Box>

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
                Runs: {model.runs?.toLocaleString()}
              </Text>
              <Text fontSize="lg" color="gray.500" mb="4">
                Last Updated: {model.lastUpdated}
              </Text>
            </Box>
          ))}
        </Box>
        <SimilarCreators similarCreators={similarCreators} data={allModels} />
      </Container>
    </>
  );
}
