// pages/models/[platform]/[model].js
import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Container,
  Box,
  Heading,
  Text,
  Flex,
  Link,
  Stack,
} from "@chakra-ui/react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/context/AuthContext";

// Utility imports
import { fetchModelDataBySlug } from "@/pages/api/utils/modelsData";
import { fetchModelsPaginated } from "@/pages/api/utils/fetchModelsPaginated";

// Dynamic imports
const MetaTags = dynamic(() => import("@/components/MetaTags"));
const ModelDetailsButtons = dynamic(() =>
  import("@/components/modelDetailsPage/ModelDetailsButtons")
);
const ModelOverview = dynamic(() =>
  import("@/components/modelDetailsPage/ModelOverview")
);

// Regular component imports
import RelatedModels from "@/components/RelatedModels";
import BookmarkButton from "@/components/BookmarkButton";
import AuthForm from "@/components/AuthForm";
import SocialScore from "@/components/SocialScore";
import LimitMessage from "@/components/LimitMessage";
import TwitterFollowButton from "@/components/TwitterFollowButton";
import ImageLightbox from "@/components/ImageLightbox";
import EmojiWithGradient from "@/components/EmojiWithGradient";

//
// getStaticPaths
//
export async function getStaticPaths() {
  // Adjust platforms, pageSize, and limit as needed
  const platforms = ["huggingface"];
  const paths = [];
  const pageSize = 1000;
  const limit = 100;

  for (const platform of platforms) {
    let currentPage = 1;
    let totalFetched = 0;

    while (totalFetched < limit) {
      const { data: models } = await fetchModelsPaginated({
        tableName: "modelsData",
        platform,
        pageSize,
        currentPage,
      });

      models.forEach((m) => {
        paths.push({
          params: {
            model: m.slug.toString(),
            platform,
          },
        });
      });

      totalFetched += models.length;
      if (models.length < pageSize || totalFetched >= limit) break;
      currentPage += 1;
    }
  }

  // fallback: 'true' => build pages on-demand if not in paths
  return {
    paths,
    fallback: true,
  };
}

//
// getStaticProps
//
export async function getStaticProps({ params }) {
  const { platform, model: slug } = params;
  let model = null;
  let error = false;

  try {
    model = await fetchModelDataBySlug(slug, platform);
  } catch (err) {
    error = true;
  }

  // Fallback if model is missing or fetch failed
  if (!model || error) {
    return {
      props: { error: true, slug },
      revalidate: 60,
    };
  }

  // Revalidate once a day
  return {
    props: { model, slug, error: false },
    revalidate: 86400,
  };
}

//
// Main Page Component
//
function ModelDetailsPage({ model, slug, error }) {
  const { user, hasActiveSubscription } = useAuth();

  // Track number of unique resource views
  const [viewCounts, setViewCounts] = useState({
    totalUniqueViews: 0,
    uniqueResources: [],
    canViewFullArticle: true,
  });

  // Prevent repeated API calls in development due to Strict Mode
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!model?.slug) return;

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    // Ensure we have or create a session ID
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem("sessionId", sessionId);
    }

    axios
      .get("/api/resource-view-count", {
        params: {
          session_id: sessionId,
          resource_type: "models",
        },
      })
      .then((response) => {
        if (!response.data) throw new Error("Failed to fetch view counts");

        // If user has viewed 5+ unique models, limit content
        const { uniqueResources = [] } = response.data;
        response.data.canViewFullArticle =
          Array.isArray(uniqueResources) && uniqueResources.length < 5;

        setViewCounts(response.data);
      })
      .catch(() => {
        // silently fail or handle as needed
      });
  }, [model?.slug]);

  // Show fallback if there's an error or no model data
  if (error || !model) {
    return (
      <Box maxW="100vw" overflowX="hidden" p={8}>
        <Heading as="h1" fontSize="1.2rem" fontWeight="bold" mb="1rem">
          Model Temporarily Unavailable
        </Heading>
        <Text>
          We’re having trouble loading <strong>{slug}</strong>. Please try again
          later.
        </Text>
      </Box>
    );
  }

  return (
    <Box maxW="100vw" overflowX="hidden">
      <MetaTags
        title={`${model.modelName} | AI Model Details`}
        description={model.description || ""}
        socialPreviewImage={model.example}
        socialPreviewTitle={model.modelName}
        socialPreviewSubtitle={model.description || ""}
      />

      <Container maxW="container.md" py="12">
        <Box mb="4">
          <Heading as="h1" mb={2}>
            <Link href={model.modelUrl} isExternal>
              {model.modelName}
            </Link>
          </Heading>

          <Flex
            fontSize="sm"
            mb={2}
            px="0.5px"
            color="gray.500"
            alignItems="center"
            gap={2}
          >
            <Text noOfLines={1}>
              Maintainer:{" "}
              <Link
                href={`/creators/${encodeURIComponent(
                  model.platform
                )}/${encodeURIComponent(model.creator)}`}
                _hover={{ color: "blackAlpha.900" }}
                color="black.500"
              >
                {model.creator}
              </Link>{" "}
              - Last updated {new Date(model.lastUpdated).toLocaleDateString()}
            </Text>
          </Flex>

          <ModelDetailsButtons model={model} />

          <Box width="100%" mt={3}>
            {model.example ? (
              <ImageLightbox
                src={model.example}
                alt={model.modelName}
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            ) : (
              <EmojiWithGradient title={model.modelName} />
            )}
          </Box>

          <Box minH="650px" mt={6}>
            {!viewCounts.canViewFullArticle && !hasActiveSubscription ? (
              <LimitMessage />
            ) : (
              <>
                {!user && (
                  <Box
                    my={6}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text align="center" fontWeight="bold" mb={4} fontSize="lg">
                      Get notified when new models like this one come out!
                    </Text>
                    <AuthForm signupSource="auth-form-embed" isUpgradeFlow />
                  </Box>
                )}

                <ModelOverview model={model} />

                <hr />
                <Text mt={3} color="gray.500" fontStyle="italic">
                  This summary was produced with help from an AI and may contain
                  inaccuracies—check the original source!
                </Text>

                <Stack
                  direction={["column", "row"]}
                  spacing={5}
                  w="100%"
                  my={8}
                >
                  <SocialScore resource={model} />
                  <BookmarkButton resourceType="model" resourceId={model.id}>
                    Bookmark
                  </BookmarkButton>
                </Stack>
              </>
            )}
          </Box>
        </Box>
      </Container>

      <Box minH="600px">
        {(viewCounts.canViewFullArticle || hasActiveSubscription) && (
          <Container maxW="container.xl" py="12">
            <Box mt={8} textAlign="center">
              <TwitterFollowButton />
            </Box>
            <RelatedModels slug={model.slug} platform={model.platform} />
          </Container>
        )}
      </Box>
    </Box>
  );
}

export default ModelDetailsPage;
