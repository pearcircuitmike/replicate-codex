// /components/Bookmarks/BookmarkHeader.js
import { Box, Heading, Text } from "@chakra-ui/react";

const BookmarkHeader = ({ paperCount, modelCount }) => (
  <Box mb={6}>
    <Heading size="lg" mb={2}>
      Bookmarks
    </Heading>
    <Text color="gray.600">
      {paperCount} papers, {modelCount} models
    </Text>
  </Box>
);

export default BookmarkHeader;
