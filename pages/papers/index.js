// pages/papers/index.js
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Grid,
  Box,
  Text,
  Input,
  Checkbox,
  Stack,
  Button,
  SimpleGrid,
  Heading,
  Collapse,
  Icon,
  Spinner,
} from "@chakra-ui/react";
import MetaTags from "../../components/MetaTags";
import PaperCard from "../../components/PaperCard";
import Pagination from "../../components/Pagination";
import { FaFilter } from "react-icons/fa";
import { Configuration, OpenAIApi } from "openai";
import { fetchPapersPaginated } from "../../utils/fetchPapers";
import { fetchPapersWithEmbeddings } from "../../utils/fetchPapersWithEmbeddings";

const openAi = new OpenAIApi(
  new Configuration({ apiKey: process.env.NEXT_PUBLIC_OPENAI_CLIENT_KEY })
);

const categoryDescriptions = {
  "cs.AI": "Artificial Intelligence",
  "cs.CL": "Computation and Language",
  "cs.CV": "Computer Vision",
  "cs.CY": "Computers and Society",
  "cs.DC": "Distributed Computing",
  "cs.ET": "Emerging Technologies",
  "cs.HC": "Human-Computer Interaction",
  "cs.IR": "Information Retrieval",
  "cs.LG": "Machine Learning",
  "cs.MA": "Multiagent Systems",
  "cs.MM": "Multimedia",
  "cs.NE": "Neural/Evolutionary Computing",
  "cs.RO": "Robotics",
  "cs.SD": "Sound",
  "cs.NI": "Networking and Information Architecture",
  "eess.AS": "Audio and Speech Processing",
  "eess.IV": "Image and Video Processing",
  "stat.ML": "Machine Learning",
};

export async function getServerSideProps({ query }) {
  const { search, selectedCategories, page } = query;
  const currentPage = parseInt(page) || 1;
  const { data, totalCount } = await fetchPapersPaginated({
    tableName: "arxivPapersData",
    pageSize: 20,
    currentPage,
    searchValue: search || null,
    selectedCategories: selectedCategories
      ? JSON.parse(selectedCategories)
      : Object.keys(categoryDescriptions),
  });

  return {
    props: {
      initialPapers: data,
      totalPaperCount: totalCount,
      initialSearch: search || "",
      initialSelectedCategories: selectedCategories
        ? JSON.parse(selectedCategories)
        : Object.keys(categoryDescriptions),
      initialPage: currentPage,
    },
  };
}

const PapersIndexPage = ({
  initialPapers,
  totalPaperCount,
  initialSearch,
  initialSelectedCategories,
  initialPage,
}) => {
  const router = useRouter();
  const [papers, setPapers] = useState(initialPapers);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState(
    initialSelectedCategories
  );
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isCategoryControlOpen, setIsCategoryControlOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(totalPaperCount);
  const [loading, setLoading] = useState(false);
  const pageSize = 20;

  const fetchPapers = async (query) => {
    setLoading(true);

    if (query) {
      const prompt = `the user's query will be sent to you to generate an answer, and then use the answer for 
      semantic search to find an AI research paper that can produce the solution to the problem or idea or use 
      case the user is describing. 


example user query: infinite context window LLM

hypothetical research paper that answers the user's query: This paper provides a comprehensive survey of various techniques for compressing and accelerating deep neural networks. It covers methods such as pruning, quantization, knowledge distillation, and low-rank approximation, among others. The survey discusses the principles behind each technique, their advantages and limitations, and provides insights into their effectiveness in improving inference speed without significantly compromising model accuracy.

      . Now respond similarly: The user's query: ${query}. The expanded hypothetical research paper for use in semantic search:`;

      console.log("LLM Prompt:", prompt);

      const gptResponse = await openAi.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      const generatedResponse = gptResponse.data.choices[0].message.content;

      console.log("LLM Response:", generatedResponse);

      const embeddingResponse = await openAi.createEmbedding({
        model: "text-embedding-ada-002",
        input: generatedResponse,
      });

      const embedding = embeddingResponse.data.data[0].embedding;

      const { papers, totalCount } = await fetchPapersWithEmbeddings(
        embedding,
        0.75,
        pageSize,
        selectedCategories
      );
      setPapers(papers);
      setTotalCount(totalCount);
    } else {
      const { data, totalCount } = await fetchPapersPaginated({
        tableName: "arxivPapersData",
        pageSize,
        currentPage,
        searchValue,
        selectedCategories,
      });
      setPapers(data);
      setTotalCount(totalCount);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!searchValue) {
      fetchPapers(null);
    }
  }, [currentPage, selectedCategories, pageSize]);

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    router.push({
      pathname: "/papers",
      query: {
        search: searchValue,
        selectedCategories: JSON.stringify(selectedCategories),
        page: 1,
      },
    });
    fetchPapers(searchValue);
  };

  const handleCategoryChange = (category) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((cat) => cat !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updatedCategories);
    setCurrentPage(1);
    router.push({
      pathname: "/papers",
      query: {
        search: searchValue,
        selectedCategories: JSON.stringify(updatedCategories),
        page: 1,
      },
    });
  };

  const handleSelectAll = () => {
    setSelectedCategories(Object.keys(categoryDescriptions));
    setCurrentPage(1);
    router.push({
      pathname: "/papers",
      query: {
        search: searchValue,
        selectedCategories: JSON.stringify(Object.keys(categoryDescriptions)),
        page: 1,
      },
    });
  };

  const handleDeselectAll = () => {
    setSelectedCategories([]);
    setCurrentPage(1);
    router.push({
      pathname: "/papers",
      query: {
        search: searchValue,
        selectedCategories: JSON.stringify([]),
        page: 1,
      },
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    router.push({
      pathname: "/papers",
      query: {
        search: searchValue,
        selectedCategories: JSON.stringify(selectedCategories),
        page: newPage,
      },
    });
  };

  return (
    <>
      <MetaTags
        title="AI Papers | Browse and Discover Latest Research"
        description="Explore the latest research papers on artificial intelligence, machine learning, and related fields. Browse through summaries, categories, and authors."
      />
      <Container maxW="container.xl" py="12">
        <Box mb={6}>
          <Text fontSize="3xl" fontWeight="bold">
            AI Papers
          </Text>
          <Text fontSize="lg">
            Browse and discover the latest research papers on artificial
            intelligence, machine learning, and related fields.
          </Text>
        </Box>
        <Box mb={6}>
          <Input
            placeholder="Search papers..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            mr={4}
          />
          <Button
            mt={2}
            onClick={handleSearchSubmit}
            isLoading={loading}
            loadingText="Searching..."
          >
            Search
          </Button>
          <Button
            mt={2}
            ml={2}
            leftIcon={<Icon as={FaFilter} />}
            onClick={() => setIsCategoryControlOpen(!isCategoryControlOpen)}
          >
            Filter by Category
          </Button>
        </Box>
        <Collapse in={isCategoryControlOpen} animateOpacity>
          <Box mb={6}>
            <Heading size="md" mb={2}>
              Arxiv Categories
            </Heading>
            <SimpleGrid columns={2} spacing={1}>
              {Object.entries(categoryDescriptions).map(
                ([category, description]) => (
                  <Checkbox
                    key={category}
                    isChecked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  >
                    <b>{category}</b> - {description}
                  </Checkbox>
                )
              )}
            </SimpleGrid>
            <Stack direction="row" mt={4}>
              <Button size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button size="sm" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </Stack>
          </Box>
        </Collapse>
        {loading ? (
          <Box mt={6} textAlign="center">
            <Spinner size="xl" />
            <Text mt={2}>Searching papers...</Text>
          </Box>
        ) : papers.length === 0 ? (
          <Box mt={6}>
            <Text>
              No papers found. Please try a different search or category.
            </Text>
          </Box>
        ) : (
          <>
            <Grid
              templateColumns={{
                base: "repeat(1, 1fr)",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
                xl: "repeat(4, 1fr)",
              }}
              gap={6}
            >
              {papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </Grid>
            <Pagination
              totalCount={totalCount}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </Container>
    </>
  );
};

export default PapersIndexPage;
