import React from "react";
import { Container, VStack, Heading, Text } from "@chakra-ui/react";

const HeroSection = ({ isMobile }) => {
  return (
    <Container maxW="5xl" mt={isMobile ? "50px" : "100px"} textAlign="center">
      <VStack spacing={8} mb={8}>
        <Heading as="h1" fontSize={isMobile ? "3xl" : "4xl"} fontWeight="bold">
          Find the AI breakthroughs that{" "}
          <Text
            bgGradient="linear(to-tr, #3182CE,#38A169)"
            bgClip="text"
            fontWeight="extrabold"
            display="inline"
          >
            actually
          </Text>{" "}
          matter
        </Heading>
        <Text fontSize={isMobile ? "md" : "lg"} color="gray.600">
          Thousands of AI papers, models, and tools are released daily. We scan
          repos, journals, and social media to bring you the ones that matter.
        </Text>
      </VStack>
    </Container>
  );
};

export default HeroSection;
