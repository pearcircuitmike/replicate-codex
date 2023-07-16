import { useState } from "react";
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
import ModelPricingSummary from "../../../components/modelDetailsPage/ModelPricingSummary";
import RunsHistoryChart from "../../../components/modelDetailsPage/RunsHistoryChart";
import calculateCreatorRank from "../../../utils/calculateCreatorRank";
import calculateModelRank from "../../../utils/calculateModelRank";
import { findSimilarModels } from "../../../utils/modelsData";
import { findCreatorModels } from "../../../utils/modelsData";
import GradioEmbed from "@/components/modelDetailsPage/GradioEmbed";

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

  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const model = await fetchModelDataById(params.model, params.platform);

  const modelsData = await fetchAllDataFromTable(`combinedModelsData`);

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
  const [selectedSource, setSelectedSource] = useState(
    model.demoSources ? model.demoSources[0] : ""
  );
  const similarModels = findSimilarModels(model, modelsData);
  const creatorModels = findCreatorModels(model, modelsData);

  const handleSourceChange = (event) => {
    setSelectedSource(event.target.value);
  };

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
              <VStack spacing={6} alignItems="start">
                <Heading as="h2" size="lg">
                  Try it!
                </Heading>
                <Text>
                  You can use this area to play around with demo applications
                  that incorporate the {model.modelName} model. These demos are
                  maintained and hosted externally by third-party creators. If
                  you see an error,{" "}
                  <Link
                    href={`https://twitter.com/mikeyoung44`}
                    color="teal"
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
                <ModelDetailsTable model={model} />
              </VStack>
            </GridItem>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
