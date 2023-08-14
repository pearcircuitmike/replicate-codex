import React from "react";
import { useRouter } from "next/router";
import ModelMatchmaker from "@/components/ModelMatchmaker";
import { Container } from "@chakra-ui/react";

const ResultsPage = () => {
  const router = useRouter();
  const { query } = router.query;

  return (
    <Container maxW="8xl">
      <h1>Search Results</h1>
      <ModelMatchmaker initialQuery={query} />
    </Container>
  );
};

export default ResultsPage;
