// pages/tools/[tool].js
import React, { useEffect } from "react";
import {
  Container,
  Box,
  Text,
  Heading,
  Link,
  Image,
  Tag,
  Icon,
  Button,
  Center,
} from "@chakra-ui/react";
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
    props: { tool, slug },
    revalidate: false,
  };
}

const ToolDetailsPage = ({ tool, slug }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://substackcdn.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    const customScript = document.createElement("script");
    customScript.innerHTML = `
      window.CustomSubstackWidget = {
        substackUrl: "aimodels.substack.com",
        placeholder: "example@gmail.com",
        buttonText: "Try it for free!",
        theme: "custom",
        colors: {
          primary: "#319795",
          input: "white",
          email: "#1A202C",
          text: "white",
        },
        redirect: "/thank-you?source=tools&slug=${encodeURIComponent(slug)}"
      };
    `;
    document.body.appendChild(customScript);

    const widgetScript = document.createElement("script");
    widgetScript.src = "https://substackapi.com/widget.js";
    widgetScript.async = true;
    document.body.appendChild(widgetScript);

    return () => {
      document.body.removeChild(script);
      document.body.removeChild(customScript);
      document.body.removeChild(widgetScript);
    };
  }, [slug]);

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
            <Link href={tool.url} isExternal>
              {tool.toolName}{" "}
              <Icon
                color="blue.500"
                as={FaExternalLinkAlt}
                style={{ display: "inline" }}
                boxSize={5}
              />
            </Link>
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
                <Link
                  key={index}
                  href={`/tools?selectedCategory=${encodeURIComponent(
                    category
                  )}`}
                >
                  <Tag size="md" colorScheme="blue" mr="10px">
                    {category}
                  </Tag>
                </Link>
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
          <Container maxW="container.md">
            <Box mt={8}>
              <Text fontWeight="bold" fontSize="lg" mb={4} align="center">
                Get updates on the latest AI tools straight to your inbox:
              </Text>
            </Box>

            <Center my={"45px"}>
              <div id="custom-substack-embed"></div>
            </Center>
          </Container>
        </Box>
      </Container>

      <Container maxW="container.xl" py="12">
        <Box mt={8} textAlign="center">
          <Button colorScheme="green" borderRadius="full">
            <a
              href="https://twitter.com/aimodelsfyi?ref_src=aimodelsfyi"
              className="twitter-follow-button"
              data-show-count="false"
            >
              Follow @aimodelsfyi on 𝕏 for trending AI tools →
            </a>

            <script
              async
              src="https://platform.twitter.com/widgets.js"
              charSet="utf-8"
            ></script>
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default ToolDetailsPage;
