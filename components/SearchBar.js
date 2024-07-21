import React from "react";
import { Input, Button, Box, useBreakpointValue } from "@chakra-ui/react";
import { trackEvent } from "../pages/api/utils/analytics-util";

const SearchBar = ({
  searchValue,
  setSearchValue,
  onSearchSubmit,
  placeholder,
  resourceType,
}) => {
  const handleChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearch = () => {
    onSearchSubmit(searchValue);
    trackEvent("search", { resource_type: resourceType, query: searchValue });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      alignItems="center"
      width="100%"
    >
      <Input
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        mb={isMobile ? 2 : 0}
        flex={isMobile ? "none" : "1"}
        mr={isMobile ? 0 : 2}
        width={isMobile ? "100%" : "auto"}
      />
      <Button
        colorScheme="blue"
        onClick={handleSearch}
        width={isMobile ? "100%" : "auto"}
        flexShrink={0}
      >
        Search
      </Button>
    </Box>
  );
};

export default SearchBar;
