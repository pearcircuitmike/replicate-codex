import { Box, Container, Heading, Text, Image, Tag } from "@chakra-ui/react";
import data from "../data/data.json";
import MetaTags from "../components/MetaTags";
import PreviewImage from "../components/PreviewImage";

export async function getStaticPaths() {
  const paths = data.map((model) => ({
    params: { model: model.id.toString() },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const model = data.find((model) => model.id === parseInt(params.model));

  return { props: { model } };
}

export default function ModelPage({ model }) {
  const sortedData = data.sort((a, b) => b.runs - a.runs); // Sort the data by runs in descending order
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
          <PreviewImage src={model.example} />

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
