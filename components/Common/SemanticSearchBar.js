import React, { useState, useEffect } from "react";
import { Input, Box, IconButton, Button } from "@chakra-ui/react";
import { FaTimes } from "react-icons/fa";
import PropTypes from "prop-types";
import { trackEvent } from "@/pages/api/utils/analytics-util";

const SemanticSearchBar = ({
  onSearchSubmit,
  placeholder = "Search...",
  initialSearchValue = "",
  resourceType,
}) => {
  const [searchValue, setSearchValue] = useState(initialSearchValue);

  const handleSubmit = () => {
    onSearchSubmit(searchValue);
    trackEvent("semantic_search", {
      resource_type: resourceType,
      query: searchValue,
    });
  };

  const handleChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleClear = () => {
    setSearchValue("");
    onSearchSubmit("");
    trackEvent("semantic_search", {
      resource_type: resourceType,
      query: "",
    });
  };

  useEffect(() => {
    if (initialSearchValue) {
      setSearchValue(initialSearchValue);
    }
  }, [initialSearchValue]);

  return (
    <Box display="flex" alignItems="center" width="100%" position="relative">
      <Input
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        flex="1"
        mr={2}
        borderRadius="md"
        boxShadow="sm"
        aria-label="Search input"
      />
      {searchValue && (
        <IconButton
          icon={<FaTimes />}
          onClick={handleClear}
          aria-label="Clear search"
          mr={2}
          variant="ghost"
        />
      )}
      <Button onClick={handleSubmit} colorScheme="blue">
        Search
      </Button>
    </Box>
  );
};

SemanticSearchBar.propTypes = {
  onSearchSubmit: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  initialSearchValue: PropTypes.string,
  resourceType: PropTypes.string.isRequired,
};

export default SemanticSearchBar;
