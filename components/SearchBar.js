import React from "react";
import { Input, InputGroup, InputLeftElement, Icon } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ searchValue, setSearchValue, onSearch, placeholder }) => {
  const handleChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <Icon as={FaSearch} color="gray.300" />
      </InputLeftElement>
      <Input
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </InputGroup>
  );
};

export default SearchBar;
