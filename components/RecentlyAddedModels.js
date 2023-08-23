import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Spinner,
  Container,
  SimpleGrid,
  Heading,
} from "@chakra-ui/react";

import supabase from "../utils/supabaseClient";
import ModelCard from "@/components/ModelCard";

const RecentlyAddedModels = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data once the component is mounted
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch data from your API or database
    const { data: modelsData, error } = await supabase
      .from("combinedModelsData")
      .select("*")
      .not("indexedDate", "eq", null) // Exclude records where indexedDate is null
      .order("indexedDate", { ascending: false }) // Most recently indexed first
      .limit(20); // Fetch up to 20 items, change the limit as needed

    if (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setData([]);
      return;
    }

    setData(modelsData || []);
    setLoading(false);
  };

  return (
    <Box my={10}>
      <Box mt={5} textAlign="left">
        <Heading as="h2">Recently Added Models</Heading>
      </Box>

      {loading ? (
        <Box textAlign="center">
          <Spinner size="lg" />
          <Text mt={3}>Loading the most recent models...</Text>
        </Box>
      ) : data.length > 0 ? (
        <SimpleGrid
          mt={5}
          columns={{ base: 1, md: 2, lg: 4, xl: 5 }}
          spacing={5}
        >
          {data.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </SimpleGrid>
      ) : (
        <Box mt={5} textAlign="center">
          <Text>No recently added models found.</Text>
        </Box>
      )}
    </Box>
  );
};

export default RecentlyAddedModels;
