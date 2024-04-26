// ModelPage.jsx
import { useState, useEffect } from "react";
import {
  Select,
  Container,
  Grid,
  VStack,
  GridItem,
  Box,
  Text,
  Heading,
  Link,
} from "@chakra-ui/react";
import MetaTags from "../../../components/MetaTags";
import {
  fetchModelDataBySlug,
  findSimilarModels,
  findCreatorModels,
} from "../../../utils/modelsData";
import { fetchCreators } from "../../../utils/fetchCreatorsPaginated";
import SimilarModelsTable from "../../../components/modelDetailsPage/SimilarModelsTable";
import CreatorModelsTable from "../../../components/modelDetailsPage/CreatorModelsTable";
import ModelDetailsTable from "../../../components/modelDetailsPage/ModelDetailsTable";
import ModelOverview from "../../../components/modelDetailsPage/ModelOverview";
import ModelPricingSummary from "../../../components/modelDetailsPage/ModelPricingSummary";
import GradioEmbed from "@/components/modelDetailsPage/GradioEmbed";
import { kebabToTitleCase } from "@/utils/kebabToTitleCase";
import supabase from "@/utils/supabaseClient";

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

  const similarModels = await findSimilarModels(model);
  const creatorModels = await findCreatorModels(model, 5);

  return {
    props: { model, similarModels, creatorModels },
    revalidate: 60,
  };
}

export default function ModelPage({ model, similarModels, creatorModels }) {
  const [selectedSource, setSelectedSource] = useState(
    model.demoSources ? model.demoSources[0] : ""
  );
  const [creatorData, setCreatorData] = useState(null);

  useEffect(() => {
    const fetchCreatorData = async () => {
      const creatorObject = await fetchCreators({
        tableName: "unique_creators_data",
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

  const handleSourceChange = (event) => {
    setSelectedSource(event.target.value);
  };

  if (!model) {
    return <div>Loading...</div>; // or any other fallback UI
  }

  return (
    <>
      <MetaTags
        title={`${kebabToTitleCase(model.slug)} | ${kebabToTitleCase(
          model.creator
        )} | AI model details`}
        description={`Guide to running ${kebabToTitleCase(
          model.slug
        )} by ${kebabToTitleCase(model.creator)} on ${kebabToTitleCase(
          model.platform
        )}. Overview, ${
          model.tags
        } alternatives, schema, use cases, limitations, cost.`}
      />
      <Box overflowX="hidden">
        <Container maxW="container.xl" py="12">
          <Grid
            templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
            gap={{ base: 6, md: 10 }}
          >
            <GridItem>
              <VStack spacing={6} alignItems="start">
                <ModelOverview model={model} />
                <ModelPricingSummary model={model} />
                <CreatorModelsTable creatorModels={creatorModels} />
                <SimilarModelsTable similarModels={similarModels} />
              </VStack>
            </GridItem>
            <GridItem>
              <VStack spacing={6} alignItems="start">
                <Heading as="h2" size="lg">
                  Try it!
                </Heading>
                <Text>
                  You can use this area to play around with demo applications
                  that incorporate the {kebabToTitleCase(model.slug)} model.
                  These demos are maintained and hosted externally by
                  third-party creators. If you see an error,{" "}
                  <Link
                    href={`https://twitter.com/mikeyoung44`}
                    color="teal.500"
                    textDecoration="underline"
                  >
                    message me on Twitter
                  </Link>
                  .
                </Text>
                {model.demoSources?.length > 0 ? (
                  <>
                    <Select onChange={handleSourceChange}>
                      {model.demoSources.map((source, index) => (
                        <option key={index} value={source}>
                          {source}
                        </option>
                      ))}
                    </Select>
                    <GradioEmbed
                      src={`https://${selectedSource?.replace(
                        /\//g,
                        "-"
                      )}.hf.space`}
                    />
                  </>
                ) : (
                  <Text mt={2}>
                    Currently, there are no demos available for this model.
                  </Text>
                )}
                <ModelDetailsTable model={model} creator={creatorData} />
              </VStack>
            </GridItem>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
