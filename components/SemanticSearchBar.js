import React, { useState } from "react";
import {
  Input,
  Button,
  Box,
  IconButton,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { trackEvent } from "../pages/api/utils/analytics-util";

const SemanticSearchBar = ({
  searchValue,
  setSearchValue,
  onSearchSubmit,
  placeholder,
  resourceType,
  selectedTimeRange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleClear = () => {
    setSearchValue("");
    onSearchSubmit([]);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const trimmedValue = searchValue ? searchValue.trim() : "";
      await onSearchSubmit(trimmedValue);
      trackEvent("semantic_search", {
        resource_type: resourceType,
        query: trimmedValue,
        time_range: selectedTimeRange,
      });
    } catch (error) {
      console.error("Error in semantic search:", error);
      toast({
        title: "Search failed",
        description:
          "There was an error processing your search. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box display="flex" alignItems="center" width="100%" position="relative">
      <Input
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        flex="1"
        mr={2}
        borderRadius="md"
        boxShadow="sm"
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
      <Button
        colorScheme="blue"
        onClick={handleSearch}
        isLoading={isLoading}
        leftIcon={<FaSearch />}
        flexShrink={0}
      >
        Search
      </Button>
    </Box>
  );
};

export default SemanticSearchBar;
