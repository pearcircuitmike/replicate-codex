import { useState, useEffect } from "react";

const useFetchData = (
  fetchFilteredData,
  tableName,
  searchValue,
  selectedTags,
  sorts,
  currentPage,
  setCurrentPage,
  platform,
  selectedRows
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
        ids: selectedRows, // Pass selectedRows here
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
    selectedRows, // Include selectedRows as a dependency
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTags, sorts, searchValue]);

  return { filteredData, totalCount };
};

export default useFetchData;
