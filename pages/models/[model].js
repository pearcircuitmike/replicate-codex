import { Container, Grid, VStack, GridItem } from "@chakra-ui/react";
import { ExternalLinkIcon, DollarSign, User, Robot } from "@chakra-ui/icons";
import MetaTags from "../components/MetaTags";
import PreviewImage from "../components/PreviewImage";
import {
  fetchModelDataById,
  fetchDataFromTable,
} from "../../utils/supabaseClient";

import SimilarModelsTable from "../components/SimilarModelsTable";
import CreatorModelsTable from "../components/CreatorModelsTable";
import ModelDetailsTable from "../components/ModelDetailsTable";
import ModelOverview from "../components/ModelOverview";
import ModelPricingSummary from "../components/ModelPricingSummary";

import calculateCreatorRank from "../../utils/calculateCreatorRank";
import calculateModelRank from "../../utils/calculateModelRank";

import { findSimilarModels } from "../../utils/findSimilarModels";
import { findCreatorModels } from "../../utils/findCreatorModels";

export async function getStaticPaths() {
  const modelsData = await fetchDataFromTable("modelsData");
  const paths = modelsData.map((model) => ({
    params: { model: model.id.toString() },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const model = await fetchModelDataById(parseInt(params.model));
  const modelsData = await fetchDataFromTable("modelsData");

  // Calculate model rank and creator rank
  const modelRank = calculateModelRank(modelsData, model.id);
  const creatorRank = calculateCreatorRank(modelsData, model.creator);

  // Add ranks to the model object
  const modelWithRanks = {
    ...model,
    modelRank,
    creatorRank,
  };

  return { props: { model: modelWithRanks, modelsData } };
}

export default function ModelPage({ model, modelsData }) {
  const similarModels = findSimilarModels(model, modelsData);
  const creatorModels = findCreatorModels(model, modelsData);

  return (
    <>
      <MetaTags
        title={`AI model details - ${model.modelName}`}
        description={`Details about the ${model.modelName} model by ${model.creator}`}
      />
      <Container maxW="container.xl" py="12">
        <Grid
          templateColumns={{ base: "1fr", md: "1fr 2fr" }}
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
            <ModelDetailsTable model={model} />
          </GridItem>
        </Grid>
      </Container>
    </>
  );
}
