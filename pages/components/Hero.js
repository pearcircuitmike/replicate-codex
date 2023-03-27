import * as React from "react";
import {
  Container,
  Heading,
  VStack,
  Text,
  Button,
  Link as ChakraLink,
  useMediaQuery,
} from "@chakra-ui/react";
import Link from "next/link";

const Hero = () => {
  const [isMobile] = useMediaQuery("(max-width: 480px)");

  return (
    <Container maxWidth="800">
      <VStack
        spacing={isMobile ? 4 : 6}
        alignItems="center"
        mt={isMobile ? 4 : 8}
        mb={isMobile ? 8 : 16}
      >
        <Heading
          as="h1"
          fontSize={isMobile ? "3xl" : "4xl"}
          fontWeight="bold"
          textAlign="center"
        >
          Search Replicate AI Models
        </Heading>
        <Text
          fontSize={isMobile ? "md" : "lg"}
          textAlign="center"
          color="gray.500"
        >
          Search, filter, and sort AI models. Find the right one for your AI
          project.
        </Text>
        <Link
          href="https://notes.replicatecodex.com/#/portal/signup/free"
          passHref
        >
          <Button
            backgroundColor="yellow.500"
            colorScheme="yellow"
            variant="solid"
            rounded="md"
            color="white"
          >
            📧 Email me about new models!
          </Button>
        </Link>
      </VStack>
    </Container>
  );
};

export default Hero;
