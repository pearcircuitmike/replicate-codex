import {
  Container,
  Grid,
  VStack,
  GridItem,
  Box,
  Text,
  Heading,
} from "@chakra-ui/react";
import { ExternalLinkIcon, DollarSign, User, Robot } from "@chakra-ui/icons";
import MetaTags from "../../../components/MetaTags";

import {
  fetchModelDataById,
  fetchAllDataFromTable,
} from "../../../utils/modelsData.js";

import SimilarModelsTable from "../../../components/modelDetailsPage/SimilarModelsTable";
import CreatorModelsTable from "../../../components/modelDetailsPage/CreatorModelsTable";
import ModelDetailsTable from "../../../components/modelDetailsPage/ModelDetailsTable";
import ModelOverview from "../../../components/modelDetailsPage/ModelOverview";
import ModelPricingSummary from "../../../components/ModelPricingSummary";
import RunsHistoryChart from "../../../components/modelDetailsPage/RunsHistoryChart";

import calculateCreatorRank from "../../../utils/calculateCreatorRank";
import calculateModelRank from "../../../utils/calculateModelRank";

import { findSimilarModels } from "../../../utils/modelsData";
import { findCreatorModels } from "../../../utils/modelsData";

export async function getStaticPaths() {
  const platforms = ["replicate", "cerebrium", "deepInfra", "huggingFace"];
  const paths = [];

  for (const platform of platforms) {
    const modelsData = await fetchAllDataFromTable(`${platform}ModelsData`);
    for (const model of modelsData) {
      paths.push({
        params: { model: model.id.toString(), platform },
      });
    }
  }

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const model = await fetchModelDataById(params.model, params.platform);

  const modelsData = await fetchAllDataFromTable(
    `${params.platform}ModelsData`
  );

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
              <ModelDetailsTable model={model} />
            </GridItem>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
