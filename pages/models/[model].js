import {
  Box,
  Container,
  Heading,
  Text,
  Badge,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Image,
  Link,
  Tag,
} from "@chakra-ui/react";
import data from "../data/data.json";
import Head from "next/head";

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
      <Head>
        <meta httpEquiv="content-language" content="en-us" />

        <title>AI model details - {model.modelName}</title>
        <meta
          name="description"
          content={`Details about the ${model.modelName} model by ${model.creator}`}
        />

        <meta property="og:title" content="Replicate Codex | All Models" />
        <meta
          property="og:description"
          content={`Details about the ${model.modelName} model by ${model.creator}`}
        />

        <meta property="og:url" content="https://replicatecodex.com" />
        {model.example !== "" ? (
          <meta property="og:image" content={model.example} />
        ) : (
          <meta
            property="og:image"
            content="https://replicatecodex.com/socialImg.png"
          />
        )}
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:description"
          content={`Details about the ${model.modelName} model by ${model.creator}`}
        />
        {model.example !== "" ? (
          <meta property="twitter:image" content={model.example} />
        ) : (
          <meta
            property="twitter:image"
            content="https://replicatecodex.com/socialImg.png"
          />
        )}

        <link rel="icon" href="/favicon.ico" />
      </Head>
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

          <Image
            src={
              model.example !== ""
                ? model.example
                : "https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png"
            }
            alt={`Example of ${model.modelName}`}
            mb="8"
          />
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
