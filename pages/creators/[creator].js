import { useRouter } from "next/router";
import {
  Box,
  Container,
  Divider,
  Image,
  Text,
  Link,
  VStack,
  Heading,
  Stack,
  Badge,
  Flex,
} from "@chakra-ui/react";
import data from "../data/data.json";

const CreatorDetails = ({ model, otherModels }) => {
  const {
    modelName,
    description,
    example,
    displayCost,
    displayRuns,
    lastUpdated,
    modelUrl,
    tags,
  } = model;

  return (
    <Container maxW="container.xl" py="12">
      <Stack spacing="8">
        <Box>
          <Heading as="h2" size="xl">
            {modelName}
          </Heading>
          <Text fontSize="lg" color="gray.500" mt="2">
            {description}
          </Text>
          <Image
            src={example}
            alt={modelName}
            mt="8"
            boxShadow="md"
            rounded="md"
          />
          <Stack direction={{ base: "column", md: "row" }} mt="8" spacing="4">
            <Badge colorScheme="purple">{tags}</Badge>
            <Text fontSize="lg">{displayCost}</Text>
            <Text fontSize="lg">{displayRuns}</Text>
            <Text fontSize="lg" color="gray.500">
              {lastUpdated}
            </Text>
            <Link href={modelUrl} target="_blank" fontSize="lg">
              View Model
            </Link>
          </Stack>
        </Box>

        {otherModels.length > 0 && (
          <Box>
            <Divider mt="8" mb="4" />

            <Stack spacing="4">
              <Heading as="h3" size="lg">
                Other Models by {model.creator}
              </Heading>
              <Flex overflowX="auto" w="100%" pb="4">
                {otherModels.map((otherModel) => (
                  <Box
                    key={otherModel.id}
                    borderWidth="1px"
                    p="6"
                    rounded="md"
                    shadow="md"
                    mr="4"
                    w={{ base: "80%", md: "25%" }}
                    flexShrink={0}
                  >
                    <Heading as="h4" size="lg">
                      {otherModel.modelName}
                    </Heading>
                    <Text fontSize="lg" color="gray.500" mt="2">
                      {otherModel.description}
                    </Text>
                    <Image
                      src={otherModel.example}
                      alt={otherModel.modelName}
                      mt="8"
                      boxShadow="md"
                      rounded="md"
                    />
                    <Stack
                      direction={{ base: "column", md: "row" }}
                      mt="8"
                      spacing="4"
                    >
                      <Badge colorScheme="purple">{otherModel.tags}</Badge>
                      <Text fontSize="lg">{otherModel.displayCost}</Text>
                      <Text fontSize="lg">{otherModel.displayRuns}</Text>
                      <Text fontSize="lg" color="gray.500">
                        {otherModel.lastUpdated}
                      </Text>
                      <Link
                        href={otherModel.modelUrl}
                        target="_blank"
                        fontSize="lg"
                      >
                        View Model
                      </Link>
                    </Stack>
                  </Box>
                ))}
              </Flex>
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default CreatorDetails;

export async function getStaticPaths() {
  const paths = data.map((model) => ({
    params: { creator: model.creator.toString() },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const creator = params.creator;
  const model = data.find((model) => model.creator === creator);
  const otherModels = data.filter(
    (otherModel) => otherModel.creator === creator && otherModel.id !== model.id
  );

  return { props: { model, otherModels } };
}
