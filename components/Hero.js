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
        <Heading
          as="h1"
          fontSize={isMobile ? "3xl" : "4xl"}
          fontWeight="bold"
          textAlign="center"
        >
          A free tool to find the best AI model for your startup
        </Heading>
        <Text
          fontSize={isMobile ? "md" : "lg"}
          textAlign="center"
          color="gray.500"
        >
          Describe your problem and get an AI model that can solve it.
        </Text>

        <Box>
          <div id="custom-substack-embed"></div>

          <iframe
            src="https://aimodels.substack.com/embed"
            width="100%"
            height="auto"
            style={{
              border: "0px solid #EEE",
              background: "white",
            }}
          ></iframe>
        </Box>
      </VStack>
    </Container>
  );
};

export default Hero;
