// SearchField.js
import React from "react";
import { Input } from "@chakra-ui/react";

const SearchField = ({ searchValue, handleSearchChange }) => {
  return (
    <Input
      placeholder="Search"
      value={searchValue}
      onChange={handleSearchChange}
      maxW="650px"
    />
  );
};

export default SearchField;
