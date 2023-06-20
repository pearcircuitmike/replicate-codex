import React from "react";
import { Icon } from "@chakra-ui/react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { Th } from "@chakra-ui/react";

const SortableTableHeader = ({
  column,
  displayName,
  width,
  sortColumn,
  sortOrder,
  onSort,
  isNumeric = false,
}) => {
  return (
    <Th width={width} isNumeric={isNumeric} onClick={() => onSort(column)}>
      {displayName}
      {sortColumn === column ? (
        sortOrder === "asc" ? (
          <Icon as={FaSortUp} pl={1} />
        ) : (
          <Icon as={FaSortDown} pl={1} />
        )
      ) : (
        <Icon as={FaSort} pl={1} />
      )}
    </Th>
  );
};

export default SortableTableHeader;
