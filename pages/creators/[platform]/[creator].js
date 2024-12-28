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
 * 1) We fetch the first 50 creators for SSG paths.
 * 2) We fetch 10 models for each creator during build.
 * 3) The page may still fetch more data client-side (like creator details).
 */

export async function getStaticPaths() {
  const creatorsData = await fetchCreators({
    tableName: "unique_creators_data_view",
    pageSize: 50,
    currentPage: 1,
    searchValue: "",
  });

  const paths = creatorsData.data.map(({ creator, platform }) => ({
    params: { creator: creator.toLowerCase(), platform },
  }));

  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { creator, platform } = params;

  const modelsResponse = await fetchModelsByCreator({
    tableName: "modelsData",
    pageSize: 10,
    currentPage: 1,
    creator,
    platform,
  });

  const models = modelsResponse.data;

  return {
    props: { creator, models, platform },
    revalidate: 3600 * 24,
  };
}

/**
 * Skeleton card for loading states
 */
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

/**
 * Main Page Component
 */
export default function Creator({ creator, models, platform }) {
  /**
   * We still fetch “creatorData” on the client,
   * so we track when it's loading to show placeholders.
   */
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

  return (
    <>
      <MetaTags
        title={`AI model creator details for ${creator}`}
        description={`Details about ${creator}'s account on Replicate and their AI models`}
        socialPreviewImage="https://em-content.zobj.net/social/emoji/artist-palette.png"
        socialPreviewTitle={`AI models by ${kebabToTitleCase(creator)}`}
        socialPreviewSubtitle={`Explore ${modelCount} ${kebabToTitleCase(
          platform
        )} ${modelText} by ${kebabToTitleCase(creator)}`}
      />

      {/* 
        Container for the entire page 
        with consistent spacing/padding.
      */}
      <Container maxW="container.xl" py="12">
        {/* 
          Heading section with a fallback skeleton 
          if creator info is not yet loaded.
        */}
        <Box minH="88px" mb={8}>
          <Heading as="h1" size="xl" mb="2">
            {/* 
              If we are still loading creator data, 
              we can show a skeleton or a fallback. 
              But the `creator` prop is always available from SSG. 
              The extra data is in "creatorData," so we might do an if-check 
              if you want to customize. For now we just show the name 
              from the props. 
            */}
            {toTitleCase(creator)}
          </Heading>

          {/* Show some extra detail if you want, or skeleton if loading. */}
          {isCreatorLoading ? (
            <Skeleton height="24px" width="200px" />
          ) : creatorData ? (
            <Text fontSize="lg" color="gray.500">
              {creatorData?.bio
                ? `Bio: ${creatorData.bio}`
                : `Models on ${toTitleCase(platform)}`}
            </Text>
          ) : (
            <Text color="gray.500" fontStyle="italic">
              No additional data found for this creator.
            </Text>
          )}
        </Box>

        {/* 
          Section for the creator’s models. 
          We keep a minH to avoid layout jump, 
          and show skeleton cards if needed.
        */}
        <Box minH="400px">
          <Heading as="h2" size="lg" mb={4}>
            {isCreatorLoading ? (
              <Skeleton height="24px" width="180px" />
            ) : (
              `Models by this creator`
            )}
          </Heading>

          {models && models.length > 0 ? (
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
              spacing={4}
              w="100%"
            >
              {/* 
                If we wanted to simulate a loading state for the models, 
                we'd do a conditional. But models come from getStaticProps, 
                so they're already available at build time. 
                For demonstration, we can show skeleton cards if 
                isCreatorLoading is still true.
              */}
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
