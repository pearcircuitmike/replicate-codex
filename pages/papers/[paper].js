import React from "react";
import {
  Container,
  Box,
  Text,
  Heading,
  Link,
  Image,
  Tag,
  Wrap,
  WrapItem,
  Icon,
} from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import MetaTags from "../../components/MetaTags";
import { fetchPaperDataById } from "../../utils/fetchPapers";

export async function getServerSideProps({ params }) {
  const paper = await fetchPaperDataById(params.paper);

  if (!paper) {
    return { notFound: true };
  }

  return { props: { paper } };
}

const PaperDetailsPage = ({ paper }) => {
  // Check if the paper prop is defined
  if (!paper) {
    return <div>Loading...</div>; // or any other fallback UI
  }

  return (
    <>
      <MetaTags
        title={`${paper.title} | AI Research Paper Details`}
        description={paper.abstract}
      />
      <Container maxW="container.md" py="12">
        <Box>
          <Heading as="h1" mb={2}>
            <Link href={`https://arxiv.org/abs/${paper.arxivId}`} isExternal>
              {paper.title}{" "}
              <Icon
                color="blue.500"
                as={FaExternalLinkAlt}
                style={{ display: "inline" }}
                boxSize={5}
              />
            </Link>
          </Heading>
          <Text fontSize="lg" mb={4}>
            {paper.arxivId}
          </Text>
          <Text fontSize="md" mb={4}>
            Published {paper.publishedDate} by{" "}
            <Wrap>
              {paper.authors &&
                paper.authors.map((author, index) => (
                  <WrapItem key={index}>
                    <Link
                      href={`/authors/${encodeURIComponent(author)}`}
                      color="blue.500"
                      textDecoration="underline"
                    >
                      {author}
                    </Link>
                    {index < paper.authors.length - 1 && ", "}
                  </WrapItem>
                ))}
            </Wrap>
          </Text>
          <Box mb={4}>
            {paper.arxivCategories &&
              paper.arxivCategories.map((category, index) => (
                <Link
                  key={index}
                  href={`/papers?selectedCategories=${encodeURIComponent(
                    JSON.stringify([category])
                  )}`}
                >
                  <Tag size="md" colorScheme="blue" mr="10px">
                    {category}
                  </Tag>
                </Link>
              ))}
          </Box>
          {paper.thumbnail && (
            <Image
              src={paper.thumbnail}
              alt={paper.title}
              mb={6}
              fallbackSrc="/placeholder.png"
            />
          )}
          <Box bg="gray.100" p={4} mb={6}>
            <Heading as="h2" mb={2}>
              Abstract
            </Heading>
            <Text>{paper.abstract}</Text>
          </Box>

          <div>
            <ReactMarkdown components={ChakraUIRenderer()}>
              {paper.generatedSummary}
            </ReactMarkdown>
          </div>
          <br />
          <hr />

          <Box mt={8}>
            <Text fontWeight="bold" fontSize="lg" mb={4} align="center">
              Get summaries of the top AI research delivered straight to your
              inbox:
            </Text>
            <Box>
              <div id="custom-substack-embed"></div>
              <iframe
                src="https://aimodels.substack.com/embed"
                width="100%"
                height="auto"
                border="0px solid #EEE"
                bg="white"
              ></iframe>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default PaperDetailsPage;
