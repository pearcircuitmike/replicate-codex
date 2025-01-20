import React from "react";
import { Box, Container, Heading, Flex, Text, Icon } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";

const benefits = [
  "Read unlimited summaries (free users can only read 5)",
  "See trending topics in publications",
  "See what's popular with other researchers",
  "Bookmark resources for easy reference",
  "Join 200+ Discord community members",
  "Get weekly digests of top models and papers",
];

const BenefitsSection = () => {
  return (
    <Box py={16} px={8}>
      <Container maxW="2xl">
        <Heading as="h2" fontSize="4xl" mb={8} textAlign="center">
          A subscription gets you...
        </Heading>
        <Box px={8}>
          {benefits.map((benefit, index) => (
            <Flex key={index} alignItems="center" mb={4}>
              <Icon as={CheckCircleIcon} color="green.500" mr={2} />
              <Text fontSize="xl">{benefit}</Text>
            </Flex>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default BenefitsSection;
