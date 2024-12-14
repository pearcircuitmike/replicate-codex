// /components/Bookmarks/BookmarkHeader.js
import { Box, Heading, Text, HStack } from "@chakra-ui/react";

const BookmarkHeader = ({
  paperCount,
  modelCount,
  folderName,
  folderColor,
}) => (
  <Box mb={6}>
    <Heading fontSize={{ base: "xl", md: "2xl" }} mb={2}>
      <HStack spacing={2}>
        {folderName && (
          <>
            <Box
              w="12px"
              h="12px"
              borderRadius="full"
              bg={folderColor || "gray.200"}
              flexShrink={0}
            />
            <Text>Bookmarks in &quot;{folderName}&quot;</Text>
          </>
        )}
        {!folderName && <Text>Bookmarks</Text>}
      </HStack>
    </Heading>
    <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
      {paperCount} papers, {modelCount} models
    </Text>
  </Box>
);

export default BookmarkHeader;
