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
  resourceType,
}) => {
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Debounce search submission (e.g., to the backend)
  const debouncedSearchSubmit = useCallback(
    debounce((value) => {
      onSearchSubmit(value); // Submit the search after debouncing
    }, 300), // Adjust debounce delay as needed
    [onSearchSubmit]
  );

  // Debounce event tracking for search (separate from search submission)
  const debouncedTrackEvent = useCallback(
    debounce((value) => {
      trackEvent("semantic_search", {
        resource_type: resourceType,
        query: value,
      }); // Track semantic search with resourceType
    }, 500), // Adjust debounce delay as needed for tracking
    [resourceType]
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearchSubmit(value); // Trigger debounced search submit
    debouncedTrackEvent(value); // Trigger debounced event tracking
  };

  const handleClear = () => {
    setSearchValue("");
    onSearchSubmit(""); // Clear the search results
    trackEvent("semantic_search", { resource_type: resourceType, query: "" }); // Track clear search event
  };

  useEffect(() => {
    if (initialSearchValue) {
      setSearchValue(initialSearchValue);
    }
    return () => {
      debouncedSearchSubmit.cancel();
      debouncedTrackEvent.cancel();
    };
  }, [initialSearchValue, debouncedSearchSubmit, debouncedTrackEvent]);

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
