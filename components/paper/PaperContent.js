// components/paper/PaperContent.js
import React from "react";
import { Box, Heading, Text, Link, Icon } from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import PaperFigures from "../PaperFigures";
import PaperTables from "../PaperTables";
import PaperVote from "../PaperVote";
import TaskTag from "@/components/TaskTag";
import LimitMessage from "@/components/LimitMessage";
import PDFViewer from "@/components/PDFViewer";
import customTheme from "@/components/MarkdownTheme";

const PaperContent = ({ paper, hasActiveSubscription, viewCounts }) => {
  const renderContent = (content) => {
    if (!content) return { overview: null, restOfContent: null };

    const overviewStart = content.indexOf("## Overview");
    const overviewEnd = content.indexOf("## Plain English Explanation");

    if (overviewStart !== -1 && overviewEnd !== -1) {
      const overview = content.slice(overviewStart, overviewEnd);
      const restOfContent =
        content.slice(0, overviewStart) + content.slice(overviewEnd);

      return {
        overview: (
          <Box id="overview" bg="gray.50" rounded="lg" p={6} mb={6} shadow="sm">
            <ReactMarkdown
              components={ChakraUIRenderer({
                ...customTheme,
                h2: (props) => {
                  return (
                    <Heading
                      {...props}
                      id="overview"
                      as="h2"
                      size="lg"
                      mb={4}
                    />
                  );
                },
              })}
            >
              {overview}
            </ReactMarkdown>
          </Box>
        ),
        restOfContent: (
          <ReactMarkdown
            components={ChakraUIRenderer({
              ...customTheme,
              h2: (props) => {
                const id = props.children[0]
                  .toLowerCase()
                  .replace(/[^a-zA-Z0-9]+/g, "-");
                return (
                  <Heading {...props} id={id} as="h2" size="lg" mt={8} mb={4} />
                );
              },
            })}
          >
            {restOfContent}
          </ReactMarkdown>
        ),
      };
    }

    return {
      overview: null,
      restOfContent: (
        <ReactMarkdown
          components={ChakraUIRenderer({
            ...customTheme,
            h2: (props) => {
              const id = props.children[0]
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+/g, "-");
              return (
                <Heading {...props} id={id} as="h2" size="lg" mt={8} mb={4} />
              );
            },
          })}
        >
          {content}
        </ReactMarkdown>
      ),
    };
  };

  const { overview, restOfContent } = renderContent(paper.generatedSummary);
  const canViewContent =
    hasActiveSubscription || viewCounts?.canViewFullArticle;

  return (
    <Box
      bg="white"
      rounded="lg"
      shadow="base"
      p={6}
      mb="60vh" // Add margin at bottom for chat
    >
      <Box mb={5}>
        <Heading as="h1" size="lg" mb={4}>
          {paper.title}
        </Heading>

        <Box fontSize="sm" color="gray.600" mb={4}>
          <Text as="span">
            Published {new Date(paper.publishedDate).toLocaleDateString()} by{" "}
          </Text>
          {paper.authors?.map((author, index) => (
            <React.Fragment key={index}>
              <Link
                href={`/authors/${paper.platform}/${author}`}
                color="blue.500"
                _hover={{ textDecoration: "underline" }}
              >
                {author}
              </Link>
              {index < paper.authors.length - 1 && ", "}
            </React.Fragment>
          ))}
        </Box>
      </Box>

      {!canViewContent ? (
        <LimitMessage />
      ) : (
        <>
          {overview}
          {restOfContent}

          {paper.paperGraphics?.length > 0 && (
            <PaperFigures figures={paper.paperGraphics} title="Paper Figures" />
          )}

          {paper.paperTables?.length > 0 && (
            <Box my={6}>
              <PaperTables tables={paper.paperTables} />
            </Box>
          )}

          {paper.pdfUrl && (
            <Box my={6}>
              <Heading as="h2" id="full-paper" mb={5}>
                Full paper
              </Heading>
              <PDFViewer url={paper.pdfUrl} />
              <Text mt={5}>
                Read original:{" "}
                <Link
                  href={`https://arxiv.org/abs/${paper.arxivId}`}
                  isExternal
                  color="blue.500"
                >
                  <Text as="span" textDecoration="underline">
                    arXiv:{paper.arxivId}
                  </Text>
                  <Icon as={FaExternalLinkAlt} ml={1} boxSize={3} />
                </Link>
              </Text>
            </Box>
          )}

          <Box mt={8} pt={4} borderTop="1px" borderColor="gray.200">
            <PaperVote paperId={paper.id} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default PaperContent;
