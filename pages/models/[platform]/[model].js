import { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  Container,
  Box,
  Text,
  Heading,
  Link,
  Flex,
  Stack,
  Skeleton,
  useToast,
} from "@chakra-ui/react";
import { FaBookmark } from "react-icons/fa";

import MetaTags from "../../../components/MetaTags";
import { fetchModelDataBySlug } from "../../api/utils/modelsData";
import { fetchCreators } from "../../api/utils/fetchCreatorsPaginated";
import ModelDetailsButtons from "@/components/modelDetailsPage/ModelDetailsButtons";
import ModelOverview from "../../../components/modelDetailsPage/ModelOverview";
import { kebabToTitleCase } from "@/pages/api/utils/kebabToTitleCase";
import supabase from "@/pages/api/utils/supabaseClient";
import EmojiWithGradient from "@/components/EmojiWithGradient";
import RelatedModels from "../../../components/RelatedModels";
import fetchRelatedModels from "../../api/utils/fetchRelatedModels";
import BookmarkButton from "../../../components/BookmarkButton";
import AuthForm from "../../../components/AuthForm";
import SocialScore from "../../../components/SocialScore";
import LimitMessage from "@/components/LimitMessage";
import { useAuth } from "../../../context/AuthContext";
import ImageLightbox from "@/components/ImageLightbox";
import TwitterFollowButton from "@/components/TwitterFollowButton";

//
// SSG: Build-time functions
//
export async function getStaticPaths({ numPages = 100 }) {
  const { data: models } = await supabase
    .from("modelsData")
    .select("slug, platform");

  const paths = models.slice(0, numPages).map((model) => ({
    params: { model: model.slug, platform: model.platform },
  }));

  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { platform, model: slug } = params;

  const model = await fetchModelDataBySlug(slug, platform);
  if (!model) {
    return { notFound: true };
  }

  const relatedModels = await fetchRelatedModels(model.embedding);

  return {
    props: { model, relatedModels, slug },
    revalidate: 3600 * 24,
  };
}

//
// Main Page Component
//
export default function ModelPage({ model, relatedModels, slug }) {
  const { user, hasActiveSubscription, loading } = useAuth();
  const [creatorData, setCreatorData] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const toast = useToast();

  const [viewCounts, setViewCounts] = useState({
    totalUniqueViews: 0,
    uniqueResources: [],
    canViewFullArticle: true,
  });

  // Track component mount to safely render client-only code
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch view counts
  useEffect(() => {
    const fetchViewCounts = async () => {
      if (!slug || loading) return;

      let sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem("sessionId", sessionId);
      }

      try {
        const response = await axios.get(`/api/resource-view-count`, {
          params: {
            session_id: sessionId,
            resource_type: "models",
          },
        });
        const data = response.data;
        setViewCounts(data);
      } catch (error) {
        console.error(
          "Error fetching view counts:",
          error.response || error.message
        );
      }
    };

    fetchViewCounts();
  }, [slug, hasActiveSubscription, loading, toast]);

  // Fetch creator data
  useEffect(() => {
    async function fetchCreatorData() {
      if (!model?.creator || !model?.platform) return;
      const creatorObject = await fetchCreators({
        tableName: "unique_creators_data_view",
        pageSize: 1,
        currentPage: 1,
        creatorName: model.creator,
        platform: model.platform,
      });
      const fetchedCreatorData =
        creatorObject.data.length > 0 ? creatorObject.data[0] : null;
      setCreatorData(fetchedCreatorData);
    }
    fetchCreatorData();
  }, [model.creator, model.platform]);

  // If model is missing, show fallback skeleton
  if (!model) {
    return (
      <>
        <MetaTags
          title="Loading Model..."
          description="Model details are loading..."
        />
        <Container maxW="container.md" py="12">
          <Box mb="4">
            <Heading as="h1" size="xl" mb="2">
              <Skeleton height="35px" width="220px" />
            </Heading>
            <Skeleton height="18px" width="100px" mb={3} />
            <Skeleton height="300px" />
          </Box>
        </Container>
      </>
    );
  }

  // Normal content if model is available
  return (
    <>
      <MetaTags
        socialPreviewImage={model.example}
        socialPreviewTitle={kebabToTitleCase(model.modelName)}
        socialPreviewSubtitle={`How to use ${kebabToTitleCase(
          model.creator
        )}'s ${kebabToTitleCase(model.modelName)} model on ${kebabToTitleCase(
          model.platform
        )}.`}
        title={`${kebabToTitleCase(model.modelName)} by ${kebabToTitleCase(
          model.creator
        )} | AI model details`}
        description={`Guide to running the ${kebabToTitleCase(
          model.modelName
        )} by ${kebabToTitleCase(model.creator)} on ${kebabToTitleCase(
          model.platform
        )}. Overview, schema, use cases, limitations. Includes example inputs and outputs, as well as some related models.`}
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

          <ModelDetailsButtons model={model} creator={creatorData} />

          {/* 
            Make the image fill the container’s full width,
            preserve aspect ratio (height="auto"), and avoid layout shift.
          */}
          <Box width="100%" mt={3}>
            {model.example ? (
              <Box width="100%">
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
              </Box>
            ) : (
              <Box width="100%">
                <EmojiWithGradient title={model?.modelName} />
              </Box>
            )}
          </Box>

          {/* 
            Reserve space for content below, even if toggled. 
            Adjust minH to ensure stable layout. 
          */}
          <Box minH="650px" mt={6}>
            {!viewCounts.canViewFullArticle && !hasActiveSubscription ? (
              <LimitMessage />
            ) : (
              <>
                {/* 
                  Auth prompt is conditionally rendered, but we fix a min-height 
                  and center it to avoid layout shifting and keep it visually centered.
                */}
                <Box
                  my={6}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                >
                  {isMounted && !user && (
                    <>
                      <Text
                        align="center"
                        fontWeight="bold"
                        mb={4}
                        fontSize="lg"
                      >
                        Get notified when new models like this one come out!
                      </Text>
                      <AuthForm signupSource="auth-form-embed" isUpgradeFlow />
                    </>
                  )}
                  {/* For logged-in users, simply render nothing here */}
                </Box>

                <ModelOverview model={model} />

                <hr />
                <Text mt={3} color="gray.500" fontStyle="italic">
                  This summary was produced with help from an AI and may contain
                  inaccuracies — check the links to read the original source
                  documents!
                </Text>

                <Stack
                  direction={["column", "row"]}
                  spacing={5}
                  w="100%"
                  my={8}
                >
                  <SocialScore resource={model} />
                  <Box w={["100%", "auto"]}>
                    <BookmarkButton
                      resourceType="model"
                      resourceId={model.id}
                      leftIcon={<FaBookmark />}
                      w={["100%", "140px"]}
                    >
                      Bookmark
                    </BookmarkButton>
                  </Box>
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
            <RelatedModels relatedModels={relatedModels} />
          </Container>
        )}
      </Box>
    </>
  );
}
