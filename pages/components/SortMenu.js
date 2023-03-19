import React, { useState } from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  Button,
  VStack,
  HStack,
  Select,
  MenuGroup,
  MenuDivider,
  MenuItem,
  IconButton,
  Tooltip,
  Text,
  Flex,
  Wrap,
  WrapItem,
  CloseButton,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

const SortMenu = ({ onSortChange }) => {
  const [sorts, setSorts] = useState([]);

  const handleAddSort = () => {
    const defaultColumn = columns.find(
      (column) => !sortedColumns.includes(column.field)
    );
    const newSort = {
      column: defaultColumn ? defaultColumn.field : "",
      direction: "asc",
    };
    setSorts([...sorts, newSort]);
    if (defaultColumn) {
      onSortChange([...sorts, newSort]);
    }
  };

  const handleSortChange = (index, key, value) => {
    const newSorts = [...sorts];
    newSorts[index][key] = value;
    setSorts(newSorts);
    if (key === "column" && value === "") {
      onSortChange(newSorts.filter((sort) => sort.column !== ""));
    } else {
      onSortChange(newSorts);
    }
  };

  const handleRemoveSort = (index) => {
    const newSorts = sorts.filter((_, i) => i !== index);
    setSorts(newSorts);
    onSortChange(newSorts);
  };

  const handleClearSorts = () => {
    setSorts([]);
    onSortChange([]);
  };

  const columns = [
    { name: "Creator", field: "creator" },
    { name: "Model", field: "modelName" },
    { name: "Description", field: "description" },
    { name: "Tags", field: "tags" },
    { name: "Example", field: "example" },
    { name: "Replicate URL", field: "modelUrl" },
    { name: "Runs", field: "runs" },
    { name: "Cost", field: "costToRun" },
    { name: "Last Updated", field: "lastUpdated" },
  ];

  const sortedColumns = sorts.map((sort) => sort.column);
  return (
    <Menu>
      <MenuButton as={Button} colorScheme="teal">
        Add Sort
      </MenuButton>
      <MenuList minWidth="320px">
        <MenuGroup title="Sort Options">
          <VStack alignItems="start" spacing="1px" ml={3} mr={3}>
            {sorts.map((sort, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <HStack spacing={2}>
                  <Select
                    placeholder="Select column"
                    value={sort.column}
                    onChange={(e) =>
                      handleSortChange(index, "column", e.target.value)
                    }
                  >
                    {columns.map((column) => (
                      <option
                        key={column.field}
                        value={column.field}
                        disabled={sortedColumns.includes(column.field)}
                      >
                        {column.name}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={sort.direction}
                    onChange={(e) =>
                      handleSortChange(index, "direction", e.target.value)
                    }
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </Select>
                  <IconButton
                    aria-label="Remove sort"
                    icon={<DeleteIcon />}
                    size="sm"
                    onClick={() => handleRemoveSort(index)}
                  />
                </HStack>
              </div>
            ))}
            <Button onClick={handleAddSort} size="sm" colorScheme="teal">
              Add Sort
            </Button>
          </VStack>
        </MenuGroup>
        <MenuDivider />
        <MenuItem
          icon={<DeleteIcon />}
          color="red.500"
          onClick={handleClearSorts}
        >
          Clear
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default SortMenu;
