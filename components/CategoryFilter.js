import React, { useState } from "react";
import {
  Box,
  Checkbox,
  SimpleGrid,
  Heading,
  Collapse,
  Icon,
  Button,
  Stack,
} from "@chakra-ui/react";
import { FaFilter, FaCaretDown, FaCaretUp } from "react-icons/fa";

const CategoryFilter = ({
  categoryDescriptions,
  selectedCategories,
  onCategoryChange,
  isModelsPage,
}) => {
  const [isCategoryControlOpen, setIsCategoryControlOpen] = useState(false);

  const handleCategoryChange = (category) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((cat) => cat !== category)
      : [...selectedCategories, category];
    onCategoryChange(updatedCategories);
  };

  const handleSelectAll = () => {
    onCategoryChange(Object.keys(categoryDescriptions));
  };

  const handleDeselectAll = () => {
    onCategoryChange([]);
  };

  return (
    <Box mb={6}>
      <Button
        mt={2}
        leftIcon={<Icon as={FaFilter} />}
        rightIcon={
          isCategoryControlOpen ? (
            <Icon as={FaCaretUp} />
          ) : (
            <Icon as={FaCaretDown} />
          )
        }
        onClick={() => setIsCategoryControlOpen(!isCategoryControlOpen)}
      >
        Filter by Category ({selectedCategories.length})
      </Button>
      <Collapse in={isCategoryControlOpen} animateOpacity>
        <Box mt={4}>
          <Heading size="md" mb={2}>
            {isModelsPage ? "Model Categories" : "Arxiv Categories"}
          </Heading>
          <SimpleGrid columns={2} spacing={1}>
            {Object.entries(categoryDescriptions).map(
              ([category, description]) => (
                <Checkbox
                  key={category}
                  isChecked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                >
                  {isModelsPage ? (
                    description
                  ) : (
                    <>
                      <b>{category}</b> - {description}
                    </>
                  )}
                </Checkbox>
              )
            )}
          </SimpleGrid>
          <Stack direction="row" mt={4}>
            <Button size="sm" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button size="sm" onClick={handleDeselectAll}>
              Deselect All
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default CategoryFilter;
