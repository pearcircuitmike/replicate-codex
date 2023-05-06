import {
  Box,
  Heading,
  Link,
  Text,
  Image,
  Flex,
  Badge,
  Grid,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export default function SimilarModels({ currentModel, modelsData }) {
  const similarModels = modelsData
    ?.filter(
      (model) =>
        model.tags === currentModel.tags && model.id !== currentModel.id
    )
    .slice(0, 5);

  return (
    <Box>
      <Heading as="h2" size="lg" my="8">
        Similar Models
      </Heading>
      <Text>
        A model is considered similar if it has the same tag as the current
        model. Here is a list of similar models based on the data we have:
      </Text>

      {similarModels && similarModels?.length === 0 ? (
        <Text>No similar models found.</Text>
      ) : (
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
            xl: "repeat(4, 1fr)",
          }}
          gap={6}
          mt="12"
        >
          {similarModels &&
            similarModels?.map((model) => (
              <Box
                key={model.id}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                maxW="350px"
              >
                <Image
                  src={model.example}
                  alt={`${model.modelName} example`}
                  width="100%"
                  height="auto"
                />
                <Box p="6">
                  <Flex justifyContent="space-between">
                    <Text>
                      <Link
                        href={`/models/${model?.platform}/${model?.id}`}
                        textDecoration="underline"
                        color="teal"
                      >
                        {model.modelName}
                      </Link>
                    </Text>
                  </Flex>
                  <Badge colorScheme="teal">{model.tags}</Badge>

                  <Text mt={2}>Creator: {model.creator}</Text>
                  <Text>Cost/run: ${model.costToRun}</Text>
                  <Text>Runs: {model.runs.toLocaleString()}</Text>
                  <Link
                    href={model.replicateUrl}
                    textDecoration="underline"
                    color="teal"
                    mt={2}
                  >
                    Try on Replicate <ExternalLinkIcon />
                  </Link>
                </Box>
              </Box>
            ))}
        </Grid>
      )}
    </Box>
  );
}
