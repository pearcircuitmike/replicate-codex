import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useMediaQuery,
  Icon,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaCaretDown } from "react-icons/fa";

const TimeRangeFilter = ({ selectedTimeRange, onTimeRangeChange }) => {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [currentSelection, setCurrentSelection] = useState(selectedTimeRange);

  useEffect(() => {
    setCurrentSelection(selectedTimeRange);
  }, [selectedTimeRange]);

  const handleTimeRangeChangeInternal = (timeRange) => {
    setCurrentSelection(timeRange);
    onTimeRangeChange(timeRange);
  };

  const timeRanges = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "thisWeek" },
    { label: "This Month", value: "thisMonth" },
    { label: "This Year", value: "thisYear" },
    { label: "All Time", value: "allTime" },
  ];

  return (
    <Box mb={6}>
      {isMobile ? (
        <Menu>
          <MenuButton as={Button} rightIcon={<FaCaretDown />}>
            <Icon as={FaCalendarAlt} mr={2} />
            {timeRanges.find((tr) => tr.value === currentSelection)?.label ||
              "Filter by Date"}
          </MenuButton>
          <MenuList>
            {timeRanges.map((tr) => (
              <MenuItem
                key={tr.value}
                onClick={() => handleTimeRangeChangeInternal(tr.value)}
                isActive={currentSelection === tr.value}
              >
                {tr.label}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      ) : (
        <Box display="flex" flexWrap="wrap">
          {timeRanges.map((tr) => (
            <Button
              key={tr.value}
              mr={2}
              mb={2}
              onClick={() => handleTimeRangeChangeInternal(tr.value)}
              isActive={currentSelection === tr.value}
              variant={currentSelection === tr.value ? "solid" : "outline"}
            >
              {tr.label}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TimeRangeFilter;
