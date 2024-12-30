import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Skeleton,
  SimpleGrid,
} from "@chakra-ui/react";
import Head from "next/head";
import { kebabToTitleCase } from "@/pages/api/utils/kebabToTitleCase";
import MetaTags from "../../../components/MetaTags";
import ModelCard from "../../../components/Cards/ModelCard";
import { toTitleCase } from "@/pages/api/utils/toTitleCase";
import { fetchCreators } from "../../api/utils/fetchCreatorsPaginated";
import { fetchModelsByCreator } from "@/pages/api/utils/fetchModelsByCreator";

/**
 * Pure SSR: fetch data on every request.
 *
 * This replaces getStaticPaths/getStaticProps.
 */
export async function getServerSideProps({ params }) {
  const { creator, platform } = params;

  // Fetch initial models
  const modelsResponse = await fetchModelsByCreator({
    tableName: "modelsData",
    pageSize: 10,
    currentPage: 1,
    creator,
    platform,
  });

  return {
    props: {
      creator,
      platform,
      models: modelsResponse?.data || [],
    },
  };
}

function LoadingModelCard() {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p="4"
      minH="240px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Skeleton height="120px" width="100%" mb={4} />
      <Skeleton height="18px" width="80%" mb={2} />
      <Skeleton height="18px" width="60%" />
    </Box>
  );
}

export default function Creator({ creator, models, platform }) {
  const [creatorData, setCreatorData] = useState(null);
  const [isCreatorLoading, setIsCreatorLoading] = useState(true);

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        const response = await fetchCreators({
          tableName: "unique_creators_data_view",
          pageSize: 1,
          currentPage: 1,
          creatorName: creator,
          platform,
        });

        const fetchedCreatorData =
          response.data.length > 0 ? response.data[0] : null;
        setCreatorData(fetchedCreatorData);
      } catch (error) {
        console.error("Error fetching creator data:", error);
      } finally {
        setIsCreatorLoading(false);
      }
    };

    fetchCreatorData();
  }, [creator, platform]);

  const modelCount = models?.length || 0;
  const modelText = modelCount === 1 ? "model" : "models";

  // Platform-specific metadata configurations
  const platformInfo = {
    huggingface: {
      title: `${toTitleCase(creator)} - Find Top AI Models on Hugging Face`,
      description: `Looking for ${toTitleCase(
        creator
      )}'s top AI models? Browse their full HuggingFace collection of ${modelCount} ${modelText} and see how to use what they built.`,
      socialTitle: `Top AI Models by ${toTitleCase(creator)}`,
      socialSubtitle: `Browse their HuggingFace models`,
      contextDescription: creatorData?.bio || "",
    },
    replicate: {
      title: `${toTitleCase(creator)} - AI Models to Try on Replicate`,
      description: `Want to use ${toTitleCase(
        creator
      )}'s AI models? See their complete list of Replicate models. Learn about how they work. Here's ${modelCount} ${modelText} you can try today.`,
      socialTitle: `See AI Models by ${toTitleCase(creator)}`,
      socialSubtitle: `Explore their Replicate collection`,
      contextDescription: creatorData?.bio || "",
    },
  };

  const platformMeta =
    platformInfo[platform.toLowerCase()] || platformInfo.huggingface;

  return (
    <>
      <MetaTags
        title={platformMeta.title}
        description={platformMeta.description}
        socialPreviewImage="https://em-content.zobj.net/social/emoji/artist-palette.png"
        socialPreviewTitle={platformMeta.socialTitle}
        socialPreviewSubtitle={platformMeta.socialSubtitle}
      />

      <Container maxW="container.xl" py="12">
        <Box minH="88px" mb={8}>
          <Heading as="h1" size="xl" mb="2">
            {toTitleCase(creator)}
          </Heading>

          {isCreatorLoading ? (
            <Skeleton height="24px" width="200px" />
          ) : creatorData ? (
            <Text fontSize="lg" color="gray.500">
              {creatorData?.bio || platformMeta.contextDescription}
            </Text>
          ) : (
            <Text color="gray.500" fontStyle="italic">
              {platformMeta.contextDescription}
            </Text>
          )}
        </Box>

        <Box minH="400px">
          <Heading as="h2" size="lg" mb={4}>
            {isCreatorLoading ? (
              <Skeleton height="24px" width="180px" />
            ) : (
              `Available Models (${modelCount})`
            )}
          </Heading>

          {models && models.length > 0 ? (
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
              spacing={4}
              w="100%"
            >
              {isCreatorLoading
                ? Array(models.length)
                    .fill(null)
                    .map((_, idx) => (
                      <LoadingModelCard key={`skeleton-${idx}`} />
                    ))
                : models.map((model) => (
                    <Box key={model.id}>
                      <ModelCard model={model} />
                    </Box>
                  ))}
            </SimpleGrid>
          ) : (
            <Text>No models found for this creator.</Text>
          )}
        </Box>
      </Container>
    </>
  );
}
