import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Text,
  Heading,
  Link,
  Image,
  Icon,
  Button,
  Center,
  Stack,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useToast,
} from "@chakra-ui/react";
import { FaExternalLinkAlt, FaBookmark } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import MetaTags from "../../../components/MetaTags";
import {
  fetchPaperDataBySlug,
  fetchPapersPaginated,
  fetchAdjacentPapers,
} from "../../api/utils/fetchPapers";
import fetchRelatedPapers from "../../api/utils/fetchRelatedPapers";
import RelatedPapers from "../../../components/RelatedPapers";
import EmojiWithGradient from "../../../components/EmojiWithGradient";
import SocialScore from "../../../components/SocialScore";
import PaperNavigationButtons from "../../../components/PaperNavigationButtons";
import customTheme from "../../../components/MarkdownTheme";
import BookmarkButton from "../../../components/BookmarkButton";
import AuthForm from "../../../components/AuthForm";
import PaperNotes from "../../../components/notes/PaperNotes";
import NoteButton from "../../../components/NoteButton";
import Head from "next/head";

import { useAuth } from "../../../context/AuthContext";

export async function getStaticPaths() {
  const platforms = ["arxiv"];
  const paths = [];
  const pageSize = 1000;
  const limit = 100;

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

  const lastUpdatedDate = new Date(paper.lastUpdated);

  if (lastUpdatedDate <= oneWeekAgo) {
    return {
      props: { paper, relatedPapers, slug },
      revalidate: false,
    };
  } else {
    return {
      props: { paper, relatedPapers, slug },
      revalidate: 3600 * 2,
    };
  }
}

const PaperDetailsPage = ({ paper, relatedPapers, slug }) => {
  const [adjacentPapers, setAdjacentPapers] = useState({
    prevSlug: null,
    nextSlug: null,
  });
  const { user, hasActiveSubscription } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const fetchAdjacent = async () => {
      if (paper?.slug) {
        try {
          const { prevSlug, nextSlug } = await fetchAdjacentPapers(
            paper.slug,
            paper.platform
          );
          setAdjacentPapers({ prevSlug, nextSlug });
        } catch (error) {
          console.error("Error fetching adjacent papers:", error);
          setAdjacentPapers({ prevSlug: null, nextSlug: null });
        }
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

  const handleAddNoteClick = () => {
    onOpen();
  };

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

          <Stack direction={["column", "row"]} spacing={5} w="100%" my={8}>
            <SocialScore paper={paper} />
            <Box w={["100%", "auto"]}>
              <BookmarkButton
                resourceType="paper"
                resourceId={paper.id}
                leftIcon={<FaBookmark />}
                w={["100%", "140px"]}
              >
                Bookmark
              </BookmarkButton>
            </Box>
            <Box w={["100%", "auto"]}>
              <NoteButton
                paperId={paper.id}
                onClick={handleAddNoteClick}
                w={["100%", "auto"]}
              />
            </Box>
          </Stack>

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
          {!user && (
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
          )}
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
          <Button
            as="a"
            href="https://twitter.com/aimodelsfyi?ref_src=aimodelsfyi"
            colorScheme="green"
            borderRadius="full"
          >
            Follow @aimodelsfyi on 𝕏 →
          </Button>
        </Box>

        <RelatedPapers relatedPapers={relatedPapers} />
      </Container>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Notes</DrawerHeader>
          <DrawerBody>
            <PaperNotes paperId={paper.id} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default PaperDetailsPage;
