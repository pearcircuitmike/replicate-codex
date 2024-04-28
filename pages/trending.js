import { Box, Heading, Text, Container } from "@chakra-ui/react";
import MetaTags from "../components/MetaTags";

export default function Trending() {
  return (
    <>
      <MetaTags
        title="Trending Models | AIModels.fyi"
        description="Discover the top trending AI models in the world."
      />
      <Container maxW="4xl">
        <Box as="main" p={6}>
          <Heading as="h1" size="xl" mb={4}>
            Trending Models
          </Heading>
          <Text fontSize="xl" mb={8}>
            Explore the most popular and trending AI models across various
            platforms. These models have gained attention and usage in the AI
            community!
          </Text>
          <Text>WIP</Text>
        </Box>
      </Container>
    </>
  );
}
