import React from "react";
import { Button, Icon } from "@chakra-ui/react";
import { FaBookmark } from "react-icons/fa";

const BookmarkButton = ({ isBookmarked, onToggle }) => {
  return (
    <Button
      variant="outline"
      onClick={onToggle}
      leftIcon={
        <Icon
          as={FaBookmark}
          color={isBookmarked ? "yellow.500" : "gray.500"}
        />
      }
    >
      {isBookmarked ? "Bookmarked" : "Add to bookmarks"}
    </Button>
  );
};

export default BookmarkButton;
