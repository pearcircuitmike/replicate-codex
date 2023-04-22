import React from "react";
import { Box, Button, HStack } from "@chakra-ui/react";

const Pagination = ({ totalCount, pageSize, currentPage, onPageChange }) => {
  const pageCount = Math.ceil(totalCount / pageSize);

  const handlePrevPage = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < pageCount) onPageChange(currentPage + 1);
  };

  return (
    <Box>
      <HStack mt={5}>
        <Button
          onClick={handlePrevPage}
          isDisabled={currentPage === 1}
          colorScheme="teal"
        >
          Previous
        </Button>
        <Box>
          Page {currentPage} of {pageCount}
        </Box>
        <Button
          onClick={handleNextPage}
          isDisabled={currentPage === pageCount}
          colorScheme="teal"
        >
          Next
        </Button>
      </HStack>
    </Box>
  );
};

export default Pagination;
