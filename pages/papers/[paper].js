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
  Center,
  ListItem,
  List,
  UnorderedList,
  OrderedList,
} from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import MetaTags from "../../components/MetaTags";
import { fetchPaperDataById } from "../../utils/fetchPapers";

import emojiMap from "../../data/emojiMap.json";

const getColorByTitle = (title, index) => {
  const colors = [
    "red.500",
    "orange.500",
    "yellow.500",
    "green.500",
    "teal.500",
    "blue.500",
    "cyan.500",
    "purple.500",
    "pink.500",
  ];
  const hash = title
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = (hash + index) % colors.length;
  return colors[colorIndex];
};

const getHashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return hash;
};

const getRandomEmoji = (title) => {
  const emojis = Object.values(emojiMap);
  const hash = getHashCode(title);
  const randomIndex = Math.abs(hash) % emojis.length;
  return emojis[randomIndex];
};

const getEmojiForPaper = (title) => {
  const keywords = title.toLowerCase().split(" ");
  for (const keyword of keywords) {
    if (emojiMap[keyword]) {
      return emojiMap[keyword];
    }
  }
  return getRandomEmoji(title);
};

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

  // Function to format links in the text
  const formatLinks = (text) => {
    return text.replace(/(https?:\/\/[^\s]+)/g, (url) => `[${url}](${url})`);
  };

  // Format links in the abstract
  const formattedAbstract = formatLinks(paper.abstract);

  const bgColor1 = getColorByTitle(paper.title, 0);
  const bgColor2 = getColorByTitle(paper.title, 1);
  const gradientBg = `linear(to-r, ${bgColor1}, ${bgColor2})`;

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
      const { children } = props;
      return <Link color="blue.500">{children}</Link>;
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
            <Center h="250px" bgGradient={gradientBg}>
              <Text fontSize="6xl">{getEmojiForPaper(paper.title)}</Text>
            </Center>
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