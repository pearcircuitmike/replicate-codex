// components/SearchBar.js
import React from "react";
import { Box, Input, Button } from "@chakra-ui/react";

const SearchBar = ({
  searchValue,
  onSearchSubmit,
  setSearchValue,
  placeholder,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit(searchValue);
  };

  return (
    <Box mb={6}>
      <form onSubmit={handleSubmit}>
        <Input
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          mr={4}
        />
        <Button mt={2} type="submit" colorScheme="blue">
          Search
        </Button>
      </form>
    </Box>
  );
};

export default SearchBar;
