import React from "react";
import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  Button,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import Link from "next/link";

import MetaTags from "../components/MetaTags.js";

export default function ThankYou() {
  return (
    <>
      <MetaTags
        title={"Thank You for Subscribing! - AIModels.fyi"}
        description={
          "Thank you for subscribing to AIModels.fyi! You're now part of a community dedicated to staying on the cutting edge of AI breakthroughs."
        }
      />
      <Container maxW="3xl" mt="100px" textAlign="center">
        <VStack spacing={8}>
          <Box>
            <CheckCircleIcon boxSize={20} color="green.500" />
          </Box>
          <Heading as="h1" fontSize="4xl">
            Check your inbox and confirm your email.
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Check your inbox and be sure to confirm your email so you can start
            getting the latest, most impactful AI breakthroughs.
          </Text>
          <Box>
            <Link href="/" passHref>
              <Button colorScheme="blue" size="lg">
                Done, to the homepage!
              </Button>
            </Link>
          </Box>
        </VStack>
      </Container>
    </>
  );
}
