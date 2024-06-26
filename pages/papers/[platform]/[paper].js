// PaperDetailsPage.jsx
import React, { useEffect, useState } from "react";
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
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import MetaTags from "../../../components/MetaTags";
import {
  fetchPaperDataBySlug,
  fetchPapersPaginated,
  fetchAdjacentPapers,
} from "../../../utils/fetchPapers";
import fetchRelatedPapers from "../../../utils/fetchRelatedPapers";
import RelatedPapers from "../../../components/RelatedPapers";
import EmojiWithGradient from "../../../components/EmojiWithGradient";
import SocialScore from "../../../components/SocialScore";
import PaperNavigationButtons from "../../../components/PaperNavigationButtons";
import customTheme from "../../../components/MarkdownTheme";
import BookmarkButton from "../../../components/BookmarkButton";
import AuthForm from "../../../components/AuthForm";

export async function getStaticPaths() {
  const platforms = ["arxiv"];
  const paths = [];
  const pageSize = 1000;
  const limit = 100; // was 2000, cutting to 100

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
        break;
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

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  console.log(`Paper: ${paper.title}`);
  console.log(`Last Updated: ${paper.lastUpdated}`);
  console.log(`One Week Ago: ${oneWeekAgo}`);

  const lastUpdatedDate = new Date(paper.lastUpdated);
  console.log(`Last Updated Date: ${lastUpdatedDate}`);

  if (lastUpdatedDate <= oneWeekAgo) {
    console.log("Using SSG for this paper");
    return {
      props: { paper, relatedPapers, slug },
      revalidate: false, // Explicitly set revalidate to false for SSG
    };
  } else {
    console.log("Using ISR for this paper");
    return {
      props: { paper, relatedPapers, slug },
      revalidate: 3600 * 2, // Revalidate every 2 hours
    };
  }
}

const PaperDetailsPage = ({ paper, relatedPapers, slug }) => {
  const [adjacentPapers, setAdjacentPapers] = useState({
    prevSlug: null,
    nextSlug: null,
  });

  useEffect(() => {
    const fetchAdjacent = async () => {
      if (paper?.slug) {
        const { prevSlug, nextSlug } = await fetchAdjacentPapers(
          paper.slug,
          paper.platform
        );
        setAdjacentPapers({ prevSlug, nextSlug });
      }
    };
    fetchAdjacent();
  }, [paper]);

  if (!paper) {
    return <div>Loading...</div>;
  }

  const formatLinks = (text) => {
    const urlRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    return text.replace(urlRegex, (match, linkText, linkUrl) => {
      return `[${linkText}](${linkUrl})`;
    });
  };

  const formattedAbstract = formatLinks(paper.abstract);

  return (
    <>
      <MetaTags
        socialPreviewImage={paper.thumbnail}
        socialPreviewTitle={paper.title}
        socialPreviewSubtitle={paper.abstract}
        title={`${paper.title} | AI Research Paper Details`}
        description={paper.abstract}
      />
      <Container maxW="container.md" py="12">
        <Box mb="4">
          <PaperNavigationButtons
            prevSlug={adjacentPapers.prevSlug}
            nextSlug={adjacentPapers.nextSlug}
            platform={paper.platform}
          />
        </Box>
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
          <SocialScore paper={paper} />
          <Box fontSize="md" mb={4}>
            <Text as="span">
              Published {new Date(paper.publishedDate).toLocaleDateString()} by{" "}
            </Text>
            {paper.authors && paper.authors.length > 0 ? (
              <>
                {paper.authors.slice(0, 10).map((author, index) => (
                  <React.Fragment key={index}>
                    <Link
                      href={`/authors/${encodeURIComponent(
                        paper.platform
                      )}/${encodeURIComponent(author)}`}
                      color="blue.500"
                      textDecoration="underline"
                    >
                      {author}
                    </Link>
                    {index < 9 && index < paper.authors.length - 1 && (
                      <Text as="span">, </Text>
                    )}
                  </React.Fragment>
                ))}
                {paper.authors.length > 10 && (
                  <Text as="span">
                    {" "}
                    and {paper.authors.length - 10}{" "}
                    {paper.authors.length - 10 === 1 ? "other" : "others"}
                  </Text>
                )}
              </>
            ) : (
              <Text as="span">Unknown authors</Text>
            )}
          </Box>
          <BookmarkButton resourceType="paper" resourceId={paper.id} />

          <Box my={4}>
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
          <Container maxW="container.md">
            <Box mt={8}>
              <Text fontWeight="bold" fontSize="lg" align="center">
                Create account to get full access
              </Text>
            </Box>

            <Center my={"20px"}>
              <AuthForm />
            </Center>
          </Container>

          <div>
            <ReactMarkdown components={ChakraUIRenderer(customTheme)}>
              {paper.generatedSummary}
            </ReactMarkdown>
          </div>
          <br />
          <hr />
          <Text mt={3} color={"gray.500"} fontStyle={"italic"}>
            This summary was produced with help from an AI and may contain
            inaccuracies - check out the links to read the original source
            documents!
          </Text>
        </Box>
        <Box mt="8">
          <PaperNavigationButtons
            prevSlug={adjacentPapers.prevSlug}
            nextSlug={adjacentPapers.nextSlug}
            platform={paper.platform}
          />
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
              Follow @aimodelsfyi on 𝕏 for trending papers →
            </a>

            <script
              async
              src="https://platform.twitter.com/widgets.js"
              charSet="utf-8"
            ></script>
          </Button>
        </Box>

        <RelatedPapers relatedPapers={relatedPapers} />
      </Container>
    </>
  );
};

export default PaperDetailsPage;
