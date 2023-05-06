import { useState, useEffect } from "react";

const useFetchData = (
  fetchFilteredData,
  tableName,
  searchValue,
  selectedTags,
  sorts,
  currentPage,
  setCurrentPage
) => {
  const [totalCount, setTotalCount] = useState(0);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // Destructure both data and totalCount from the result
      const { data, totalCount } = await fetchFilteredData({
        tableName, // Pass the tableName argument here
        tags: selectedTags,
        searchValue,
        sorts,
        pageSize: 10,
        currentPage,
      });
      setFilteredData(data);
      setTotalCount(totalCount || 0); // Use totalCount or default to 0 if undefined
    }
    fetchData();
  }, [
    fetchFilteredData,
    tableName,
    searchValue,
    selectedTags,
    sorts,
    currentPage,
  ]);

  // Set current page to 1 when a value changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTags, sorts, searchValue]);

  return { filteredData, totalCount };
};

export default useFetchData;
