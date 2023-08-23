import React from "react";
import { useRouter } from "next/router";
import ModelMatchmaker from "@/components/ModelMatchmaker";
import RecentlyAddedModels from "@/components/RecentlyAddedModels";
import { Container, Heading, Center, Box, Text } from "@chakra-ui/react";

const ResultsPage = () => {
  const router = useRouter();
  const { query } = router.query;

  return (
    <Container maxW="8xl">
      <Center>
        <Heading as="h2" size="md">
          Subscribe for a free weekly digest of new AI models.
        </Heading>
      </Center>
      <iframe
        src="https://aimodels.substack.com/embed"
        width="100%"
        height="auto"
        border="0px solid #EEE"
        bg="white"
      ></iframe>
      <Heading as="h2" size="sm" mb={2}>
        Search Results
      </Heading>
      <Text mb={2}>
        Results displayed below. Modify your search to try again!
      </Text>
      <ModelMatchmaker initialQuery={query} />
      <RecentlyAddedModels />
    </Container>
  );
};

export default ResultsPage;
