import React from "react";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Wrap,
  WrapItem,
  CloseButton,
} from "@chakra-ui/react";

const FilterTags = ({ models, selectedTags, handleTagSelect }) => {
  const handleCheckboxChange = (value) => {
    handleTagSelect(value);
  };

  const handleClearFilters = () => {
    handleTagSelect([]);
  };

  return (
    <Box>
      <Menu closeOnSelect={false}>
        <MenuButton as={Button} colorScheme="teal">
          Filter By Tag
        </MenuButton>
        <MenuList minWidth="240px" maxHeight="200px" overflowY="auto">
          <CheckboxGroup value={selectedTags} onChange={handleCheckboxChange}>
            {models.map((tag) => (
              <MenuItem key={tag}>
                <Checkbox
                  mr="20px"
                  value={tag}
                  isChecked={selectedTags.includes(tag)}
                >
                  {tag}
                </Checkbox>
              </MenuItem>
            ))}
          </CheckboxGroup>
          <MenuItem onClick={handleClearFilters}>Clear filters</MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default FilterTags;
