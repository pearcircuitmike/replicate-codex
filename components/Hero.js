import * as React from "react";
import {
  Container,
  Heading,
  VStack,
  Text,
  Button,
  Link as ChakraLink,
  useMediaQuery,
  Box,
  Link,
  Image,
} from "@chakra-ui/react";

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
        <Link href="https://labelstud.io/?utm_source=newsletter&utm_medium=email&utm_campaign=aimodelsfyi&utm_id=newsletterads">
          <Image src="/heartex.png" />
        </Link>

        <Heading
          as="h1"
          fontSize={isMobile ? "3xl" : "4xl"}
          fontWeight="bold"
          textAlign="center"
        >
          Search AI Models
        </Heading>
        <Text
          fontSize={isMobile ? "md" : "lg"}
          textAlign="center"
          color="gray.500"
        >
          Search, filter, and sort AI models. Find the right one for your AI
          project. Subscribe for a monthly update of new models.
        </Text>

        <Box>
          <div id="custom-substack-embed"></div>

          <iframe
            src="https://aimodels.substack.com/embed"
            width="100%"
            height="auto"
            style={{ border: "0px solid #EEE", background: "white" }}
          ></iframe>
        </Box>
      </VStack>
    </Container>
  );
};

export default Hero;
