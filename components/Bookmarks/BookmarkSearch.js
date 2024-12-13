// /components/Bookmarks/BookmarkSearch.js
import { Box, InputGroup, InputLeftElement, Input } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";

const BookmarkSearch = ({ searchQuery, onSearchChange }) => (
  <Box mb={8}>
    <InputGroup size="lg">
      <InputLeftElement pointerEvents="none">
        <FaSearch color="gray.500" />
      </InputLeftElement>
      <Input
        type="text"
        placeholder="Search your bookmarks"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        fontSize="lg"
      />
    </InputGroup>
  </Box>
);

export default BookmarkSearch;
