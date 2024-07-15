// LibraryView.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Select,
  SimpleGrid,
} from "@chakra-ui/react";

const LibraryView = () => {
  const [libraryData, setLibraryData] = useState(null);
  const [resourceType, setResourceType] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/library");
        const data = await response.json();
        setLibraryData(data);
      } catch (error) {
        console.error("Error fetching library data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredData = libraryData?.filter(
    (item) => resourceType === "all" || item.type === resourceType
  );

  return (
    <Box p={4}>
      <Heading as="h1" size="xl" mb={6}>
        My Library
      </Heading>
      <Text mb={4}>Your saved AI models, papers, and resources.</Text>

      <Select
        value={resourceType}
        onChange={(e) => setResourceType(e.target.value)}
        mb={4}
        width="100%"
      >
        <option value="all">All Resources</option>
        <option value="paper">Papers</option>
        <option value="model">Models</option>
        <option value="creator">Creators</option>
      </Select>

      {filteredData ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {filteredData.map((item, index) => (
            <Box key={index} p={4} borderWidth={1} borderRadius="md">
              <Heading as="h3" size="md">
                {item.title}
              </Heading>
              <Text mt={2}>{item.description}</Text>
              <Text mt={2} fontSize="sm" color="gray.500">
                Type: {item.type}
              </Text>
              <VStack mt={4} spacing={2}>
                <Button size="sm" colorScheme="blue" width="100%">
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  width="100%"
                >
                  Remove
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Text>Loading library data...</Text>
      )}
    </Box>
  );
};

export default LibraryView;
