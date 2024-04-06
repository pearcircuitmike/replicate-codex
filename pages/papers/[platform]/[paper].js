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
  ListItem,
  UnorderedList,
  OrderedList,
  Button,
} from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import MetaTags from "../../../components/MetaTags";
import {
  fetchPaperDataById,
  fetchPapersPaginated,
  fetchPaperDataBySlug,
} from "../../../utils/fetchPapers";
import fetchRelatedPapers from "../../../utils/fetchRelatedPapers";
import RelatedPapers from "../../../components/RelatedPapers";
import EmojiWithGradient from "../../../components/EmojiWithGradient";

export async function getStaticPaths() {
  const platforms = ["arxiv"]; // Array of platforms, currently only "arxiv"
  const paths = [];
  const pageSize = 1000; // Number of records to fetch per page
  const limit = 2000; // Maximum number of pages to generate

  for (const platform of platforms) {
    let currentPage = 1;
    let totalFetched = 0;

    while (totalFetched < limit) {
      const { data: papers, totalCount } = await fetchPapersPaginated({
        platform: `${platform}`,
        pageSize,
        currentPage,
      });

      for (const paper of papers) {
        paths.push({
          params: { paper: paper.slug.toString(), platform },
        });
      }

      totalFetched += papers.length;

      if (papers.length < pageSize || totalFetched >= limit) {
        break; // Stop fetching if there are no more records or if the limit is reached
      }

      currentPage += 1;
    }
  }

  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { platform, paper: slug } = params;
  const paper = await fetchPaperDataBySlug(slug, platform);
  if (!paper) {
    return { notFound: true };
  }

  let relatedPapers = [];
  if (paper.embedding) {
    relatedPapers = await fetchRelatedPapers(paper.embedding);
  }

  return {
    props: { paper, relatedPapers },
    revalidate: 60,
  };
}

const PaperDetailsPage = ({ paper, relatedPapers }) => {
  // Check if the paper prop is defined
  if (!paper) {
    return <div>Loading...</div>; // or any other fallback UI
  }

  // Function to format links in the text
  const formatLinks = (text) => {
    const urlRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    return text.replace(urlRegex, (match, linkText, linkUrl) => {
      return `[${linkText}](${linkUrl})`;
    });
  };

  // Format links in the abstract
  const formattedAbstract = formatLinks(paper.abstract);

  const customTheme = {
    p: (props) => {
      const { children } = props;
      return (
        <Text my="15px" fontSize="md" lineHeight="1.45em">
          {children}
        </Text>
      );
    },
    a: (props) => {
      const { children, href } = props;
      const linkText = children.toString();
      const linkUrl = linkText.match(/\[(.*?)\]\((.*?)\)/)?.[2] || href;
      const displayText = linkText.match(/\[(.*?)\]\((.*?)\)/)?.[1] || linkText;

      return (
        <Link color="blue.500" href={linkUrl}>
          {displayText}
        </Link>
      );
    },
    em: (props) => {
      const { children } = props;
      return (
        <figcaption
          style={{
            textAlign: "center",
            fontStyle: "italic",
            fontSize: "small",
          }}
        >
          {children}
        </figcaption>
      );
    },
    ul: (props) => {
      const { children } = props;
      return (
        <UnorderedList my="18px" lineHeight="1.45em">
          {children}
        </UnorderedList>
      );
    },
    ol: (props) => {
      const { children } = props;
      return (
        <OrderedList my="18px" lineHeight="1.45em">
          {children}
        </OrderedList>
      );
    },
    li: (props) => {
      const { children } = props;
      return (
        <ListItem fontSize="md" my="9px" lineHeight="1.45em">
          {children}
        </ListItem>
      );
    },
    h2: (props) => {
      const { children } = props;
      return (
        <Heading as="h2" size="lg" lineHeight="1.45em">
          {children}
        </Heading>
      );
    },
    h3: (props) => {
      const { children } = props;
      return (
        <Heading as="h3" lineHeight="1.38em">
          {children}
        </Heading>
      );
    },
    h4: (props) => {
      const { children } = props;
      return (
        <Heading as="h4" lineHeight="1.25em">
          {children}
        </Heading>
      );
    },
  };

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
            Published {new Date(paper.publishedDate).toLocaleDateString()} by{" "}
            <Wrap>
              {paper.authors &&
                paper.authors.map((author, index) => (
                  <WrapItem key={index}>
                    <Link
                      href={`/authors/${encodeURIComponent(
                        paper.platform
                      )}/${encodeURIComponent(author)}`}
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
          {paper.thumbnail ? (
            <Image
              src={paper.thumbnail}
              alt={paper.title}
              mb={6}
              objectFit="cover"
              w="100%"
              h="250px"
            />
          ) : (
            <EmojiWithGradient title={paper.title} height="250px" />
          )}
          <Box bg="gray.100" p={4} mb={6}>
            <Heading as="h2" mb={2}>
              Abstract
            </Heading>
            <ReactMarkdown components={ChakraUIRenderer(customTheme)}>
              {formattedAbstract}
            </ReactMarkdown>
          </Box>
          <div>
            <ReactMarkdown components={ChakraUIRenderer(customTheme)}>
              {paper.generatedSummary}
            </ReactMarkdown>
          </div>
          <br />
          <hr />
        </Box>
      </Container>

      <Container maxW="container.md">
        <Box mt={8}>
          <Text fontWeight="bold" fontSize="lg" mb={4} align="center">
            Get summaries of the top AI research delivered straight to your
            inbox:
          </Text>
        </Box>
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
      </Container>

      <Container maxW="container.xl" py="12">
        <Box mt={8} textAlign="center">
          <Button colorScheme="black">
            <a
              href="https://twitter.com/mikeyoung44?ref_src=aimodelsfyi"
              class="twitter-follow-button"
              data-show-count="false"
            >
              Follow @mikeyoung44
            </a>
            <script
              async
              src="https://platform.twitter.com/widgets.js"
              charset="utf-8"
            ></script>
          </Button>
        </Box>
        <RelatedPapers relatedPapers={relatedPapers} />
      </Container>
    </>
  );
};

export default PaperDetailsPage;
