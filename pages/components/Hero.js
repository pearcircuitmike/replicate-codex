import * as React from "react";
import {
  Container,
  Heading,
  Stack,
  HStack,
  Text,
  Button,
  Image,
  Link,
} from "@chakra-ui/react";

const Hero = () => {
  return (
    <Container maxWidth="800">
      <Stack direction="column" spacing={6} alignItems="center" mt={8} mb={16}>
        <Heading as="h1" fontSize="4xl" fontWeight="bold" textAlign="center">
          Making Replicate models searchable
        </Heading>
        <Text fontSize="lg" textAlign="center" color="gray.500">
          Replicate Codex is the most comprehensive resource for exploring and
          discovering AI models available on Replicate. Search, filter, and sort
          through a vast database of AI models. Perfect for researchers,
          developers, and enthusiasts!
          <br /> <br />
          For ideas, corrections, feedback, and sponsorship,{" "}
          <a href="https://twitter.com/mikeyoung44">
            <span style={{ textDecoration: "underline", color: "teal" }}>
              tweet at me
            </span>
          </a>
          .
          <br />
          <br />
          Subscribe for a digest of new and updated Replicate models, curated by
          me.
        </Text>
        <HStack spacing={5}>
          <Button colorScheme="teal" variant="solid" rounded="md" size="lg">
            <Link href="https://replicatecodex.substack.com/?r=24w7du&utm_campaign=pub-share-checklist">
              👉 Get the emails
            </Link>
          </Button>
        </HStack>
        <Text fontSize="lg" textAlign="left" color="gray.500"></Text>
      </Stack>
    </Container>
  );
};

export default Hero;
