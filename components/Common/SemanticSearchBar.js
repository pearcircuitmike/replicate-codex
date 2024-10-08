import React, { useState, useEffect, useCallback } from "react";
import { Input, Box, IconButton, useBreakpointValue } from "@chakra-ui/react";
import { FaTimes } from "react-icons/fa";
import PropTypes from "prop-types";
import { debounce } from "lodash";
import { trackEvent } from "@/pages/api/utils/analytics-util";

const SemanticSearchBar = ({
  onSearchSubmit,
  placeholder = "Search...",
  initialSearchValue = "",
  resourceType, // Added resourceType as a prop
}) => {
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      onSearchSubmit(value);
      trackEvent("semantic_search", {
        resource_type: resourceType,
        query: value,
      }); // Track semantic search with resourceType
    }, 100),
    [onSearchSubmit, resourceType]
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setSearchValue("");
    onSearchSubmit(""); // Clear the search results
    trackEvent("semantic_search", { resource_type: resourceType, query: "" }); // Track clear search event with resourceType
  };

  useEffect(() => {
    // Update searchValue when initialSearchValue changes (only on initial load)
    if (initialSearchValue) {
      setSearchValue(initialSearchValue);
    }
    // Cleanup debounced function on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [initialSearchValue, debouncedSearch]);

  return (
    <Box display="flex" alignItems="center" width="100%" position="relative">
      <Input
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
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
    </Box>
  );
};

SemanticSearchBar.propTypes = {
  onSearchSubmit: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  initialSearchValue: PropTypes.string,
  resourceType: PropTypes.string.isRequired, // Define resourceType as required
};

export default SemanticSearchBar;
