import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { fetchAllTags } from "../../utils/supabaseClient";

const FilterTags = ({ selectedTags, handleTagSelect }) => {
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    async function fetchTags() {
      const tags = await fetchAllTags();
      setAllTags(tags);
    }

    fetchTags();
  }, []);

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
            {allTags.map((tag) => (
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
