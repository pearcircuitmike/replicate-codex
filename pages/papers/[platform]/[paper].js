import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
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
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { FaExternalLinkAlt, FaBookmark } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import MetaTags from "../../../components/MetaTags";
import {
  fetchPaperDataBySlug,
  fetchPapersPaginated,
} from "../../api/utils/fetchPapers";
import fetchRelatedPapers from "../../api/utils/fetchRelatedPapers";
import RelatedPapers from "../../../components/RelatedPapers";
import EmojiWithGradient from "../../../components/EmojiWithGradient";
import SocialScore from "../../../components/SocialScore";
import customTheme from "../../../components/MarkdownTheme";
import BookmarkButton from "../../../components/BookmarkButton";
import AuthForm from "../../../components/AuthForm";
import PaperNotes from "../../../components/notes/PaperNotes";
import NoteButton from "../../../components/NoteButton";
import CarbonAd from "../../../components/CarbonAd";
import TaskTag from "../../../components/TaskTag";

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
      revalidate: 3600 * 24,
    };
  }
}

const PaperDetailsPage = ({ paper, relatedPapers, slug }) => {
  const { user, accessToken, hasActiveSubscription, loading } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [paperTasks, setPaperTasks] = useState([]);

  const [viewCounts, setViewCounts] = useState({
    totalUniqueViews: 0,
    uniqueResources: [],
    canViewFullArticle: true,
  });

  useEffect(() => {
    const fetchPaperTasks = async () => {
      if (paper?.id && accessToken) {
        try {
          const response = await axios.get(`/api/tasks/get-followed-tasks`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              paperId: paper.id,
            },
          });

          if (!response.data || !response.data.tasks) {
            throw new Error("Failed to fetch paper tasks");
          }

          setPaperTasks(response.data.tasks);
        } catch (error) {
          console.error("Error fetching paper tasks:", error);
          toast({
            title: "Error",
            description: "Failed to fetch paper tasks",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    fetchPaperTasks();
  }, [paper, accessToken, toast]);

  useEffect(() => {
    const fetchViewCounts = async () => {
      if (!paper?.slug || loading) return;

      let sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem("sessionId", sessionId);
      }

      try {
        const response = await axios.get(`/api/resource-view-count`, {
          params: {
            session_id: sessionId,
            resource_type: "papers",
          },
        });

        if (!response.data) throw new Error("Failed to fetch view counts");

        const data = response.data;
        setViewCounts(data);
      } catch (error) {
        console.error("Error fetching view counts:", error);
        if (!hasActiveSubscription) {
          toast({
            title: "Error",
            description: "Failed to fetch article view information",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    fetchViewCounts();
  }, [paper?.slug, hasActiveSubscription, loading, toast]);

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

  const renderContent = (content) => {
    if (!content) {
      return {
        overview: null,
        restOfContent: null,
      };
    }

    const overviewStart = content.indexOf("## Overview");
    const overviewEnd = content.indexOf("## Plain English Explanation");

    if (overviewStart !== -1 && overviewEnd !== -1) {
      const overview = content.slice(overviewStart, overviewEnd);
      const restOfContent =
        content.slice(0, overviewStart) + content.slice(overviewEnd);

      return {
        overview: (
          <Box boxShadow="xs" p="6" rounded="md" bg="gray.50" mb={6}>
            <ReactMarkdown components={ChakraUIRenderer(customTheme)}>
              {overview}
            </ReactMarkdown>
          </Box>
        ),
        restOfContent: (
          <ReactMarkdown components={ChakraUIRenderer(customTheme)}>
            {restOfContent}
          </ReactMarkdown>
        ),
      };
    }

    return {
      overview: null,
      restOfContent: (
        <ReactMarkdown components={ChakraUIRenderer(customTheme)}>
          {content}
        </ReactMarkdown>
      ),
    };
  };

  const { overview, restOfContent } = renderContent(paper.generatedSummary);

  return (
    <>
      <MetaTags
        socialPreviewImage={paper.thumbnail}
        socialPreviewTitle={paper.title}
        socialPreviewSubtitle={paper.abstract}
        title={`${paper.title} | AI Research Paper Details`}
        description={paper.abstract}
      />

      <Container maxW="container.md" pt="12">
        <Box>
          <Heading as="h1" size="xl" mb={5}>
            {paper.title}
          </Heading>

          <Wrap spacing={2} mb={4}>
            {paperTasks.map((task) => (
              <WrapItem key={task.id}>
                <TaskTag task={task} initialIsFollowed={task.isFollowed} />
              </WrapItem>
            ))}
          </Wrap>

          <Box fontSize="sm" mb={4} px="0.5px" color="gray.500">
            <Text as="span">
              Read original:{" "}
              <Link
                href={`https://arxiv.org/abs/${paper.arxivId}`}
                isExternal
                _hover={{ color: "blackAlpha.900" }}
                color="black.500"
              >
                <Text as="span" textDecoration="underline">
                  arXiv:{paper.arxivId}
                </Text>
                <Icon as={FaExternalLinkAlt} ml={1} boxSize={3} />
              </Link>{" "}
              - Published {new Date(paper.publishedDate).toLocaleDateString()}{" "}
              by{" "}
            </Text>
            {paper.authors && paper.authors.length > 0 ? (
              <>
                {paper.authors.slice(0, 10).map((author, index) => (
                  <React.Fragment key={index}>
                    <Link
                      href={`/authors/${encodeURIComponent(
                        paper.platform
                      )}/${encodeURIComponent(author)}`}
                      _hover={{ color: "blackAlpha.900" }}
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

          {!user && (
            <Box>
              <CarbonAd />
            </Box>
          )}

          {viewCounts.canViewFullArticle || hasActiveSubscription ? (
            <>
              {!user && (
                <Box>
                  <Text align="center" fontWeight={"bold"} mt={10}>
                    Sign in to get full access
                  </Text>
                  <Box
                    mb={10}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <AuthForm />
                  </Box>
                </Box>
              )}
              {overview}

              {paper.thumbnail ? (
                <Image
                  src={paper.thumbnail}
                  alt={paper.title}
                  my={6}
                  objectFit="cover"
                  w="100%"
                  h="350px"
                  boxShadow="xs"
                  rounded="md"
                />
              ) : (
                <Box my={6}>
                  <EmojiWithGradient title={paper.title} height="350px" />
                </Box>
              )}
              {restOfContent}
              <br />
              <hr />
              <Text mt={3} color={"gray.500"} fontStyle={"italic"}>
                This summary was produced with help from an AI and may contain
                inaccuracies - check out the links to read the original source
                documents!
              </Text>
            </>
          ) : (
            <Container maxW="container.md">
              <Box mt={8}>
                <Text fontWeight="bold" fontSize="lg" align="center">
                  You reached the limit of 5 free paper summaries for the month.
                  Become a paid subscriber to get unlimited access.
                </Text>
              </Box>
              <Center my={"20px"}>
                <AuthForm />
              </Center>
            </Container>
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
