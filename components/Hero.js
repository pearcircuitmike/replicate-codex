import * as React from "react";
import {
  Container,
  Heading,
  VStack,
  Text,
  useMediaQuery,
  Box,
  Link,
  Image,
  Grid,
  Textarea,
  Flex,
} from "@chakra-ui/react";

const Hero = () => {
  const [isMobile] = useMediaQuery("(max-width: 480px)");

  return (
    <>
      {/*  <Grid templateColumns={["1fr", "1fr 1fr"]} gap={6} mt={8} mb={16}>

        <VStack align="start" spacing={4}>
          <Heading
            as="h1"
            fontSize={isMobile ? "3xl" : "4xl"}
            fontWeight="bold"
          >
            Describe your problem. Get an AI that can solve it.
          </Heading>
          <Textarea placeholder="Describe your problem here..."></Textarea>
          <Text color="gray.500">Or try these popular searches:</Text>
          <VStack align="start" spacing={2}>
            <Link color="blue.500" textDecoration="underline">
              Turn my profile picture into a Studio Ghibli illustration
            </Link>
            <Link color="blue.500" textDecoration="underline">
              AI 3D model generators
            </Link>
            <Link color="blue.500" textDecoration="underline">
              Text-to-speech for a virtual assistant chatbot
            </Link>
            <Link color="blue.500" textDecoration="underline">
              Best AI for logo design
            </Link>
          </VStack>
          <Box>
            <Flex wrap="wrap" alignItems="center">
              <Text display="inline-block">As seen on:</Text>
              {[
                "aiInPlainEnglishLogo",
                "hackerNoonLogo",
                "betterProgrammingLogo",
                "dZoneLogo",
                "devToLogo",
              ].map((logo) => (
                <Box height="2em" mx={2}>
                  <Image
                    src={`/img/logos/media/${logo}.webp`}
                    alt={logo}
                    height="1.5em"
                    objectFit="contain"
                  />
                </Box>
              ))}
            </Flex>
          </Box>
        </VStack>


        <VStack align="start" spacing={6}>
          <Image
            src="/img/test.svg"
            alt="Test SVG"
            width="100%"
            objectFit="contain"
          />
          <Heading as="h2" fontSize="lg">
            Search 240,800+ models from 7,560+ creators on all major platforms
          </Heading>
          <Flex wrap="wrap" alignItems="center">
            {[
              "cerebriumLogo",
              "deepInfraLogo",
              "replicateLogo",
              "huggingFaceLogo",
            ].map((logo) => (
              <Box height="50px" margin={2}>
                <Image
                  src={`/img/logos/platforms/${logo}.webp`}
                  alt={logo}
                  height="1.5em"
                  objectFit="contain"
                />
              </Box>
            ))}
          </Flex>
        </VStack>
      </Grid>*/}
    </>
  );
};

export default Hero;
