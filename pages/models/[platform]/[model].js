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

// Utility functions for data fetching
import { fetchModelDataBySlug } from "@/pages/api/utils/modelsData";
import { fetchModelsPaginated } from "@/pages/api/utils/fetchModelsPaginated";

// Import MetaTags statically so SSR can include them
import MetaTags from "@/components/MetaTags";

// Dynamic imports for non-meta components
const ModelDetailsButtons = dynamic(() =>
  import("@/components/ModelDetailsPage/ModelDetailsButtons")
);
const ModelOverview = dynamic(() =>
  import("@/components/ModelDetailsPage/ModelOverview")
);

// Regular imports for other components
import RelatedModels from "@/components/RelatedModels";
import BookmarkButton from "@/components/BookmarkButton";
import AuthForm from "@/components/AuthForm";
import SocialScore from "@/components/SocialScore";
import LimitMessage from "@/components/LimitMessage";
import TwitterFollowButton from "@/components/TwitterFollowButton";
import ImageLightbox from "@/components/ImageLightbox";
import EmojiWithGradient from "@/components/EmojiWithGradient";

// -----------------------------------------------------
// getStaticPaths
// -----------------------------------------------------
export async function getStaticPaths() {
  const pageSize = 1000;
  const limit = 100;
  const paths = [];

  let currentPage = 1;
  let totalFetched = 0;

  while (totalFetched < limit) {
    const { data: models } = await fetchModelsPaginated({
      tableName: "modelsData",
      pageSize,
      currentPage,
    });

    models.forEach((m) => {
      if (m.slug && m.platform) {
        paths.push({
          params: {
            platform: m.platform,
            model: m.slug,
          },
        });
      }
    });

    totalFetched += models.length;
    if (models.length < pageSize || totalFetched >= limit) {
      break;
    }
    currentPage += 1;
  }

  return {
    paths,
    fallback: true, // or 'blocking', depending on your needs
  };
}

// -----------------------------------------------------
// getStaticProps
// -----------------------------------------------------
export async function getStaticProps({ params }) {
  const { platform, model: slug } = params;
  let modelData = null;
  let error = false;

  try {
    modelData = await fetchModelDataBySlug(slug, platform);
    if (!modelData) {
      error = true;
    }
  } catch (err) {
    console.error("Error in getStaticProps:", err);
    error = true;
  }

  if (error || !modelData) {
    return {
      props: {
        error: true,
        slug,
      },
      // No automatic revalidation
      revalidate: false,
    };
  }

  // Build the canonical URL on the server
  const DOMAIN = "https://www.aimodels.fyi"; // adjust as needed
  const canonicalUrl = `${DOMAIN}/models/${encodeURIComponent(
    platform
  )}/${encodeURIComponent(slug)}`;

  return {
    props: {
      model: modelData,
      slug,
      error: false,
      canonicalUrl,
    },
    // Only revalidate when triggered manually, if you have a flow for that
    revalidate: false,
  };
}

// -----------------------------------------------------
// Main Page Component
// -----------------------------------------------------
function ModelDetailsPage({ model, slug, error, canonicalUrl }) {
  const { user, hasActiveSubscription } = useAuth();
  const [viewCounts, setViewCounts] = useState({
    totalUniqueViews: 0,
    uniqueResources: [],
    canViewFullArticle: true,
  });

  // Prevent repeated calls in dev Strict Mode
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!model?.slug || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

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
      .then((res) => {
        if (!res.data) throw new Error("No data in resource view count");
        const { uniqueResources = [] } = res.data;
        res.data.canViewFullArticle =
          Array.isArray(uniqueResources) && uniqueResources.length < 5;
        setViewCounts(res.data);
      })
      .catch(() => {
        // handle error silently or log it
      });
  }, [model?.slug]);

  if (error || !model) {
    return (
      <Box maxW="100vw" overflowX="hidden" p={8}>
        <Heading as="h1" fontSize="1.2rem" fontWeight="bold" mb="1rem">
          Model Temporarily Unavailable
        </Heading>
        <Text>
          We are having trouble loading <strong>{slug}</strong>. Please try
          again later.
        </Text>
      </Box>
    );
  }

  return (
    <Box maxW="100vw" overflowX="hidden">
      {/* Server-rendered meta tags with canonical URL */}
      <MetaTags
        title={`${model.modelName} | AI Model Details`}
        description={model.description || ""}
        socialPreviewImage={model.example}
        socialPreviewTitle={model.modelName}
        socialPreviewSubtitle={model.description || ""}
        canonicalUrl={canonicalUrl} // Pass the server-generated canonical
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
                optimize={true}
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
