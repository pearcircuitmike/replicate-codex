// pages/tools/[tool].js
import React from "react";
import {
  Container,
  Box,
  Text,
  Heading,
  Link as ChakraLink,
  Image,
  Tag,
  Icon,
  Button,
  Center,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
import MetaTags from "../../components/MetaTags";
import {
  fetchToolDataBySlug,
  fetchToolsPaginated,
} from "../api/utils/fetchTools";

export async function getStaticPaths() {
  const { data: tools } = await fetchToolsPaginated({
    pageSize: 1000,
    currentPage: 1,
  });
  const paths = tools.map((tool) => ({
    params: { tool: tool.slug.toString() },
  }));

  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { tool: slug } = params;
  const tool = await fetchToolDataBySlug(slug);
  if (!tool) {
    return { notFound: true };
  }

  return {
    props: { tool },
    revalidate: false,
  };
}

const ToolDetailsPage = ({ tool }) => {
  if (!tool) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <MetaTags
        socialPreviewImage={tool.image}
        socialPreviewTitle={tool.toolName}
        socialPreviewSubtitle={tool.description}
        title={`${tool.toolName} | AI Tool Details`}
        description={tool.description}
      />
      <Container maxW="container.md" py="12">
        <Box>
          <Heading as="h1" mb={2}>
            {/* 
              Use NextLink and passHref, then use ChakraLink 
              so there's only one real <a> tag.
            */}
            <NextLink href={tool.url} passHref>
              <ChakraLink isExternal>
                {tool.toolName}{" "}
                <Icon
                  color="blue.500"
                  as={FaExternalLinkAlt}
                  style={{ display: "inline" }}
                  boxSize={5}
                />
              </ChakraLink>
            </NextLink>
          </Heading>
          <Box fontSize="md" mb={4}>
            <Text as="span">
              Added on {new Date(tool.indexedDate).toLocaleDateString()} by{" "}
              {tool.submitter}
            </Text>
          </Box>
          <Box mb={4}>
            {tool.categories &&
              tool.categories.map((category, index) => (
                <NextLink
                  key={index}
                  href={`/tools?selectedCategory=${encodeURIComponent(
                    category
                  )}`}
                  passHref
                >
                  <ChakraLink>
                    <Tag size="md" colorScheme="blue" mr="10px">
                      {category}
                    </Tag>
                  </ChakraLink>
                </NextLink>
              ))}
          </Box>
          <Image
            src={tool.image}
            alt={tool.toolName}
            mb={6}
            objectFit="cover"
            w="100%"
            h="250px"
          />
          <Box bg="gray.100" p={4} mb={6}>
            <Heading as="h2" mb={2}>
              Description
            </Heading>
            <Text>{tool.description}</Text>
          </Box>
        </Box>
      </Container>

      <Container maxW="container.xl" py="12">
        <Box mt={8} textAlign="center">
          {/*
            Use a single anchor here, instead of nesting
            <Button> and <a> if they both create <a> tags.
          */}
          <Button
            as="a"
            href="https://twitter.com/aimodelsfyi?ref_src=aimodelsfyi"
            target="_blank"
            rel="noopener noreferrer"
            colorScheme="green"
            borderRadius="full"
          >
            Follow @aimodelsfyi on 𝕏 for trending AI tools →
          </Button>
          <script
            async
            src="https://platform.twitter.com/widgets.js"
            charSet="utf-8"
          />
        </Box>
      </Container>
    </>
  );
};

export default ToolDetailsPage;
