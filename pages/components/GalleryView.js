import React, { useState, useEffect } from "react";
import { Box, SimpleGrid } from "@chakra-ui/react";
import ModelCard from "./ModelCard";
import Pagination from "./Pagination";
import { fetchAllDataFromTable } from "../../utils/supabaseClient"; // Import fetchAllDataFromTable

export default function GalleryView({
  fetchFilteredData,
  currentPage,
  setCurrentPage,
  searchValue,
  selectedTags,
  sorts,
}) {
  const [totalCount, setTotalCount] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [allModels, setAllModels] = useState([]); // State to store allModels

  useEffect(() => {
    async function fetchData() {
      const { data, totalCount } = await fetchFilteredData({
        tableName: "modelsData",
        tags: selectedTags,
        searchValue,
        sorts,
        pageSize: 10,
        currentPage,
      });
      setFilteredData(data);
      setTotalCount(totalCount || 0);

      // Fetch all models data
      const allData = await fetchAllDataFromTable("modelsData");
      setAllModels(allData);
    }
    fetchData();
  }, [fetchFilteredData, searchValue, selectedTags, sorts, currentPage]);

  // Set current page to 1 when a value changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTags, sorts, searchValue]);

  return (
    <Box>
      <SimpleGrid columns={[2, null, 3]} minChildWidth="250px" gap={5}>
        {filteredData.map((model) => (
          <ModelCard key={model.id} model={model} allModels={allModels} /> // Pass allModels to ModelCard
        ))}
      </SimpleGrid>
      <Pagination
        totalCount={totalCount}
        pageSize={10}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </Box>
  );
}
