import React from "react";
import {
  Flex,
  Wrap,
  WrapItem,
  Button,
  CloseButton,
  Text,
} from "@chakra-ui/react";

const ActiveSorts = ({ sorts, onRemoveSort }) => {
  if (sorts.length === 0) {
    return null;
  }

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

  return (
    <Flex alignItems="center" mt={2}>
      <Text fontSize="sm" fontWeight="semibold" mr={2}>
        Active Sorts:
      </Text>
      <Wrap spacing={2}>
        {sorts.map((sort, index) => (
          <WrapItem key={index}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRemoveSort(index)}
            >
              {columns.find((column) => column.field === sort.column)?.name ||
                "Unknown Column"}{" "}
              - {sort.direction === "asc" ? "Ascending" : "Descending"}
              <CloseButton ml={2} size="sm" />
            </Button>
          </WrapItem>
        ))}
      </Wrap>
    </Flex>
  );
};

export default ActiveSorts;
