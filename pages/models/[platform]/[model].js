// ModelPage.jsx
import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Text,
  Heading,
  Link,
  Image,
  Button,
  Flex,
  Tag,
  Tooltip,
  Stack,
  Center,
} from "@chakra-ui/react";
import { FaExternalLinkAlt, FaBookmark } from "react-icons/fa";

import MetaTags from "../../../components/MetaTags";
import { fetchModelDataBySlug } from "../../api/utils/modelsData";
import { fetchCreators } from "../../api/utils/fetchCreatorsPaginated";
import ModelDetailsTable from "../../../components/modelDetailsPage/ModelDetailsTable";
import ModelOverview from "../../../components/modelDetailsPage/ModelOverview";
import { kebabToTitleCase } from "@/pages/api/utils/kebabToTitleCase";
import PreviewImage from "@/components/PreviewImage";
import supabase from "@/pages/api/utils/supabaseClient";
import EmojiWithGradient from "@/components/EmojiWithGradient";
import RelatedModels from "../../../components/RelatedModels";
import fetchRelatedModels from "../../api/utils/fetchRelatedModels";
import { formatLargeNumber } from "@/pages/api/utils/formatLargeNumber";
import BookmarkButton from "../../../components/BookmarkButton";
import AuthForm from "../../../components/AuthForm";
import CarbonAd from "@/components/CarbonAd";
import SocialScore from "../../../components/SocialScore";
import { useAuth } from "../../../context/AuthContext";

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

export default function ModelPage({ model, relatedModels, slug }) {
  const { user, accessToken, hasActiveSubscription, loading } = useAuth();

  const [creatorData, setCreatorData] = useState(null);

  useEffect(() => {
    const fetchCreatorData = async () => {
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
    };
    fetchCreatorData();
  }, [model.creator, model.platform]);

  if (!model) {
    return <div>Loading...</div>; // or any other fallback UI
  }

  return (
    <>
      <MetaTags
        socialPreviewImage={model.example}
        socialPreviewTitle={kebabToTitleCase(model.modelName)}
        socialPreviewSubtitle={`How to use ${kebabToTitleCase(
          model.creator
        )}'s ${kebabToTitleCase(model.modelName)} model for
          ${model.tags}
         processing on ${kebabToTitleCase(model.platform)}.`}
        title={`${kebabToTitleCase(model.modelName)} by ${kebabToTitleCase(
          model.creator
        )} | AI model details`}
        description={`Guide to running the ${kebabToTitleCase(
          model.modelName
        )} by ${kebabToTitleCase(model.creator)} on ${kebabToTitleCase(
          model.platform
        )}. Overview, ${
          model.tags
        } alternatives, schema, use cases, limitations.`}
      />
      <Container maxW="container.md" py="12">
        <Box mb="4">
          <Heading as="h1" mb={2}>
            <Link href={model.modelUrl} isExternal>
              {model.modelName}
            </Link>
          </Heading>
          <Text fontSize="sm" mb={4} px="0.5px" color="gray.500">
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

          <Box my={4}>
            {model.tags && (
              <Link
                href={`/models?selectedTag=${encodeURIComponent(model.tags)}`}
              >
                <Tag size="md" colorScheme="blue">
                  {model.tags}
                </Tag>
              </Link>
            )}
          </Box>

          <Box my="8">
            <ModelDetailsTable model={model} creator={creatorData} />
          </Box>

          {model?.example ? (
            <Image
              src={model?.example}
              id={model?.id}
              alt={model?.name}
              my={6}
              objectFit="cover"
              w="100%"
              h="350px"
              boxShadow="xs"
              rounded="md"
            />
          ) : (
            <EmojiWithGradient title={model?.modelName} />
          )}

          {/* Render CarbonAd for all users */}

          <Box my={5}>
            <CarbonAd />
          </Box>

          <Container maxW="container.md">
            {!user && (
              <Box>
                <Text align="center" fontWeight={"bold"} mt={10}>
                  Sign in to get full access
                </Text>
                <Box
                  mb={10}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <AuthForm />
                </Box>
              </Box>
            )}
          </Container>

          <ModelOverview model={model} />

          <hr />
          <Text mt={3} color={"gray.500"} fontStyle={"italic"}>
            This summary was produced with help from an AI and may contain
            inaccuracies - check out the links to read the original source
            documents!
          </Text>
        </Box>
        <Stack direction={["column", "row"]} spacing={5} w="100%" my={8}>
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
      </Container>

      <Container maxW="container.xl" py="12">
        <Box mt={8} textAlign="center">
          <Button colorScheme="green" borderRadius="full">
            <a
              href="https://twitter.com/aimodelsfyi?ref_src=aimodelsfyi"
              className="twitter-follow-button"
              data-show-count="false"
            >
              Follow @aimodelsfyi on 𝕏 →
            </a>
            <script
              async
              src="https://platform.twitter.com/widgets.js"
              charSet="utf-8"
            ></script>
          </Button>
        </Box>
        <RelatedModels relatedModels={relatedModels} />
      </Container>
    </>
  );
}
