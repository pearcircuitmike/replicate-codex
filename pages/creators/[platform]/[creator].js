import { Box, Container, Heading, Text } from "@chakra-ui/react";
import { fetchAllDataFromTable } from "../../../utils/modelsData.js";
import Head from "next/head";
import SimilarCreators from "../../../components/SimilarCreators";
import ShareLinkButton from "../../../components/ShareLinkButton";
import ShareTweetButton from "../../../components/ShareTweetButton";
import calculateCreatorRank from "../../../utils/calculateCreatorRank";
import MetaTags from "../../../components/MetaTags";
import ModelCard from "../../../components/ModelCard";
import { formatLargeNumber } from "@/utils/formatLargeNumber.js";
import { toTitleCase } from "@/utils/toTitleCase.js";
import { getMedalEmoji } from "@/utils/getMedalEmoji.js";

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
        <Heading as="h1" size="xl" mb="2">
          {toTitleCase(creator)}
          {getMedalEmoji(rank)}
        </Heading>
        Rank: {calculateCreatorRank(allModels, creator)}
        <Text fontSize="lg" color="gray.500">
          Average Model Cost: ${avgCost.toFixed(4)}
        </Text>
        <Text fontSize="lg" color="gray.500" mb="8">
          Number of Runs:{" "}
          {formatLargeNumber(
            models.reduce((sum, model) => sum + model.runs, 0).toLocaleString()
          )}
        </Text>
        <Heading as="h2" size="lg" mt={2}>
          Models by this creator
        </Heading>
        <Box my={2} display="flex" flexWrap="wrap">
          {models.map((model) => (
            <Box
              key={model.id}
              width={{ base: "100%", sm: "50%", md: "33%", lg: "25%" }}
              p="4"
            >
              <ModelCard model={model} allModels={allModels} />{" "}
            </Box>
          ))}
        </Box>
        <Heading as="h2" size="lg" mt={2}>
          Similar creators
        </Heading>
        <SimilarCreators
          similarCreators={similarCreators}
          data={allModels}
          mt={1}
        />
      </Container>
    </>
  );
}
