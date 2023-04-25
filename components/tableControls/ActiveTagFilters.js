import React from "react";
import {
  Flex,
  Text,
  Wrap,
  WrapItem,
  Button,
  CloseButton,
} from "@chakra-ui/react";

const ActiveTagFilters = ({ tags, onTagClose, onTagsChange }) => {
  const handleTagClose = (tag) => {
    onTagClose(tag);
    onTagsChange(
      tags?.filter((t) => t !== tag),
      tag
    );
  };

  if (tags?.length === 0) return null;

  return (
    <Flex alignItems="center" mt={2} mb={2}>
      <Text fontSize="sm" fontWeight="semibold" mr={2}>
        Active Tag Filters:
      </Text>
      <Wrap spacing={2}>
        {tags?.map((tag) => (
          <WrapItem key={tag}>
            <Button size="sm" variant="outline" onClick={() => onTagClose(tag)}>
              {tag}
              <CloseButton ml={2} size="sm" />
            </Button>
          </WrapItem>
        ))}
      </Wrap>
    </Flex>
  );
};

export default ActiveTagFilters;
