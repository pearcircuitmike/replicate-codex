import { Box, Container, Heading, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Head from "next/head";

import MetaTags from "../../../components/MetaTags";
import ModelCard from "../../../components/ModelCard";
import { formatLargeNumber } from "@/utils/formatLargeNumber.js";
import { toTitleCase } from "@/utils/toTitleCase.js";
import { getMedalEmoji } from "@/utils/getMedalEmoji.js";
import { fetchModelsPaginated } from "../../../utils/fetchModelsPaginated";
import { fetchCreators } from "../../../utils/fetchCreatorsPaginated";

export async function getStaticPaths() {
  const creatorsData = await fetchCreators({
    tableName: "unique_creators_data",
    pageSize: 1000, // only first 1k
    currentPage: 1,
    searchValue: "", // this can be an empty string since we want all creators
  });

  const paths = creatorsData.data.map(({ creator, platform }) => ({
    params: { creator: creator.toLowerCase(), platform },
  }));

  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { creator, platform } = params;

  const modelsResponse = await fetchModelsPaginated({
    tableName: `combinedModelsData`,
    pageSize: 10, // Limiting the number of models fetched
    currentPage: 1,
    creator: creator,
    platform: platform,
  });

  const models = modelsResponse.data;
  // Calculate average model cost
  const avgCost =
    models
      .filter((model) => model.costToRun !== "")
      .reduce((sum, model) => sum + model.costToRun, 0) / models.length;

  return {
    props: { creator, models, avgCost, platform },
    revalidate: 60,
  };
}

export default function Creator({ creator, models, platform }) {
  const [creatorData, setCreatorData] = useState(null);

  useEffect(() => {
    const fetchCreatorData = async () => {
      const response = await fetchCreators({
        tableName: "unique_creators_data",
        pageSize: 1,
        currentPage: 1,
        creatorName: creator,
        platform: platform,
      });

      const fetchedCreatorData =
        response.data.length > 0 ? response.data[0] : null;
      setCreatorData(fetchedCreatorData);
    };

    fetchCreatorData();
  }, [creator, platform]);

  const avgCost =
    models
      .filter((model) => model.costToRun !== "")
      .reduce((sum, model) => sum + model.costToRun, 0) / models.length;

  return (
    <>
      <MetaTags
        title={`AI model creator details for ${creator}`}
        description={`Details about ${creator}'s account on Replicate and their AI models`}
      />

      <Container maxW="container.xl" py="12">
        <Heading as="h1" size="xl" mb="2">
          {toTitleCase(creator)}
          {getMedalEmoji(creatorData?.creatorRank)}
        </Heading>
        Rank: {creatorData?.creatorRank.toLocaleString()}
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
              <ModelCard model={model} />
            </Box>
          ))}
        </Box>
        <Heading as="h2" size="lg" mt={2}>
          Similar creators
        </Heading>
      </Container>
    </>
  );
}
