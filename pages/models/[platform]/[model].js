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
  Center,
} from "@chakra-ui/react";
import MetaTags from "../../../components/MetaTags";
import { fetchModelDataBySlug } from "../../../utils/modelsData";
import { fetchCreators } from "../../../utils/fetchCreatorsPaginated";
import ModelDetailsTable from "../../../components/modelDetailsPage/ModelDetailsTable";
import ModelOverview from "../../../components/modelDetailsPage/ModelOverview";
import { kebabToTitleCase } from "@/utils/kebabToTitleCase";
import PreviewImage from "@/components/PreviewImage";
import supabase from "@/utils/supabaseClient";
import EmojiWithGradient from "@/components/EmojiWithGradient";
import RelatedModels from "../../../components/RelatedModels";
import fetchRelatedModels from "../../../utils/fetchRelatedModels";
import { formatLargeNumber } from "@/utils/formatLargeNumber";

export async function getStaticPaths() {
  const { data: models } = await supabase
    .from("modelsData")
    .select("slug, platform");
  const paths = models.map((model) => ({
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
    revalidate: 3600,
  };
}

export default function ModelPage({ model, relatedModels, slug }) {
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

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://substackcdn.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    const customScript = document.createElement("script");
    customScript.innerHTML = `
      window.CustomSubstackWidget = {
        substackUrl: "aimodels.substack.com",
        placeholder: "example@gmail.com",
        buttonText: "Try it for free!",
        theme: "custom",
        colors: {
          primary: "#319795",
          input: "white",
          email: "#1A202C",
          text: "white",
        },
        redirect: "/thank-you?source=models&slug=${encodeURIComponent(slug)}"
      };
    `;
    document.body.appendChild(customScript);

    const widgetScript = document.createElement("script");
    widgetScript.src = "https://substackapi.com/widget.js";
    widgetScript.async = true;
    document.body.appendChild(widgetScript);

    return () => {
      document.body.removeChild(script);
      document.body.removeChild(customScript);
      document.body.removeChild(widgetScript);
    };
  }, [slug]);

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
          <Text fontSize="lg" mb={4}>
            Maintainer:{" "}
            <Link
              href={`/creators/${encodeURIComponent(
                model.platform
              )}/${encodeURIComponent(model.creator)}`}
              color="blue.500"
              textDecoration="underline"
            >
              {model.creator}
            </Link>
          </Text>
          <Flex alignItems="center" mb={4}>
            <Tooltip label="Calculated based on factors such as likes, downloads, etc">
              <Image
                src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png"
                alt="Total Score"
                boxSize="24px"
                mr={2}
              />
            </Tooltip>
            <Text fontSize="md">
              {formatLargeNumber(Math.floor(model.totalScore))}
            </Text>
          </Flex>
          <Box fontSize="md" mb={4}>
            <Text as="span">
              Last updated {new Date(model.lastUpdated).toLocaleDateString()}
            </Text>
          </Box>
          <Box mb={4}>
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

          {model?.example ? (
            <PreviewImage
              width={"100%"}
              src={model?.example}
              id={model?.id}
              modelName={model?.modelName}
            />
          ) : (
            <EmojiWithGradient title={model?.modelName} />
          )}

          <Box my="8">
            <ModelDetailsTable model={model} creator={creatorData} />
          </Box>

          <Container maxW="container.md">
            <Box mt={8}>
              <Text fontWeight="bold" fontSize="lg" mb={4} align="center">
                Get summaries of the top AI models delivered straight to your
                inbox:
              </Text>
            </Box>

            <Center my={"45px"}>
              <div id="custom-substack-embed"></div>
            </Center>
          </Container>

          <ModelOverview model={model} />

          <hr />
          <Text mt={3} color={"gray.500"} fontStyle={"italic"}>
            This summary was produced with help from an AI and may contain
            inaccuracies - check out the links to read the original source
            documents!
          </Text>
        </Box>
      </Container>

      <Container maxW="container.xl" py="12">
        <Box mt={8} textAlign="center">
          <Button colorScheme="green" borderRadius="full">
            <a
              href="https://twitter.com/aimodelsfyi?ref_src=aimodelsfyi"
              className="twitter-follow-button"
              data-show-count="false"
            >
              Follow @aimodelsfyi on 𝕏 for trending papers →
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
