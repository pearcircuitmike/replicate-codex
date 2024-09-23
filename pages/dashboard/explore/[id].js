// pages/dashboard/explore/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Box, Heading, Text, SimpleGrid, Spinner } from "@chakra-ui/react";
import DashboardLayout from "../../../components/Dashboard/Layout/DashboardLayout";
import PaperCard from "../../../components/Cards/PaperCard";

const ExplorePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [topic, setTopic] = useState(null);
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetch(`/api/dashboard/topic/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setTopic(data);
          setPapers(data.papers);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching topic:", error);
          setIsLoading(false);
        });
    }
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Spinner size="xl" />
        </Box>
      </DashboardLayout>
    );
  }

  if (!topic) {
    return (
      <DashboardLayout>
        <Box p={4}>
          <Text>Topic not found.</Text>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box p={4}>
        <Heading as="h1" size="lg" mb={2}>
          {topic.topic_name}
        </Heading>
        <Text mb={4}>Explore papers related to this trending topic.</Text>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          {papers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </SimpleGrid>
      </Box>
    </DashboardLayout>
  );
};

export default ExplorePage;
