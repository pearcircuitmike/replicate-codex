// /components/Bookmarks/BookmarkList.js
import { VStack, Text } from "@chakra-ui/react";
import BookmarkItem from "./BookmarkItem";

const BookmarkList = ({
  bookmarks,
  isLoading,
  onRemoveBookmark,
  type = "paper", // 'paper' or 'model'
}) => {
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <VStack spacing={6} align="stretch">
      {bookmarks.length > 0 ? (
        bookmarks.map((bookmark) => (
          <BookmarkItem
            key={bookmark.id}
            bookmark={bookmark}
            onRemove={onRemoveBookmark}
            type={type}
          />
        ))
      ) : (
        <Text textAlign="center" color="gray.600">
          No {type}s bookmarked yet
        </Text>
      )}
    </VStack>
  );
};

export default BookmarkList;
