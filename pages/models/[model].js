import { Box, Container, Heading, Text, Image, Tag } from "@chakra-ui/react";
import MetaTags from "../components/MetaTags";
import PreviewImage from "../components/PreviewImage";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  fetchModelDataById,
  fetchDataFromTable,
} from "../../utils/supabaseClient";

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

  return { props: { model, modelsData } };
}

export default function ModelPage({ model, modelsData }) {
  const sortedData = modelsData.sort((a, b) => b.runs - a.runs); // Sort the data by runs in descending order
  const rank = sortedData.findIndex((m) => m.id === model.id) + 1; // Calculate the rank of the current model

  return (
    <>
      <MetaTags
        title={`AI model details - ${model.modelName}`}
        description={`Details about the ${model.modelName} model by ${model.creator}`}
      />
      <Container maxW="container.xl" py="12">
        <Box>
          <Heading as="h1" size="xl" mb="2">
            {model.modelName}
          </Heading>

          <Text fontSize="lg" mb="4">
            <Tag colorScheme={"teal"}>{model.tags}</Tag>
          </Text>

          <Text fontSize="lg" color="gray.500" mb="4">
            <a
              href={`/creators/${model.creator}`}
              style={{ textDecoration: "underline", color: "teal" }}
            >
              {model.creator}
            </a>
          </Text>

          <Text fontSize="lg" color="gray.500" mb="4">
            {model.description}
          </Text>
          <Box maxW="450px" mb={5}>
            <PreviewImage src={model.example} />
            <Text>
              <a href={model.modelUrl}>
                <span style={{ textDecoration: "underline", color: "teal" }}>
                  Try this model on Replicate <ExternalLinkIcon />{" "}
                </span>
              </a>
            </Text>
          </Box>

          <Text fontSize="lg" mb="4">
            Model Rank: {rank}
            {rank == 1 ? " 🥇" : ""}
            {rank == 2 ? " 🥈" : ""}
            {rank == 3 ? " 🥉" : ""}
          </Text>
          <Text fontSize="lg" mb="4">
            Cost/run: ${model.costToRun}
          </Text>
          <Text fontSize="lg" mb="4">
            Runs: {model.runs.toLocaleString()}
          </Text>
        </Box>
      </Container>
    </>
  );
}
