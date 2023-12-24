import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Spinner,
  Container,
  SimpleGrid,
  Heading,
  Button,
  Center,
} from "@chakra-ui/react";

import supabase from "../utils/supabaseClient";
import ModelCard from "@/components/ModelCard";

const RecentlyAddedModels = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [itemsToShow, setItemsToShow] = useState(5); // New state variable

  useEffect(() => {
    // Fetch data once the component is mounted
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: modelsData, error } = await supabase
      .from("combinedModelsData")
      .select("*")
      .not("indexedDate", "eq", null)
      .order("indexedDate", { ascending: false })
      .limit(25);

    if (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setData([]);
      return;
    }

    setData(modelsData || []);
    setLoading(false);
  };

  const handleViewMore = () => {
    setItemsToShow(itemsToShow + 5); // Show 2 more rows, 5 models per row
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
        <>
          <SimpleGrid
            mt={5}
            columns={{ base: 1, md: 2, lg: 4, xl: 5 }}
            spacing={5}
          >
            {data.slice(0, itemsToShow).map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </SimpleGrid>
          {itemsToShow < data.length && (
            <Center mt={5}>
              <Button onClick={handleViewMore}>View More</Button>
            </Center>
          )}
        </>
      ) : (
        <Box mt={5} textAlign="center">
          <Text>No recently added models found.</Text>
        </Box>
      )}
    </Box>
  );
};

export default RecentlyAddedModels;
