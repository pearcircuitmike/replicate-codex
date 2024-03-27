import { useState, useEffect } from "react";
import { Box, Heading, Text, Container } from "@chakra-ui/react";
import TopModelsTable from "../components/TopModelsTable";
import MetaTags from "../components/MetaTags";
import { fetchModelDataById } from "../utils/modelsData.js";
import { fetchTopModelIds } from "@/utils/fetchTopModelIds";

export default function Trending() {
  const [models, setModels] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const topModelIds = await fetchTopModelIds(10);
        const modelDataPromises = topModelIds.map((id) =>
          fetchModelDataById(id)
        );
        const topModels = await Promise.all(modelDataPromises);
        setModels(topModels);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

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
          {models && <TopModelsTable models={models} />}
        </Box>
      </Container>
    </>
  );
}
