import React, { useState } from "react";
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

const TimeRangeFilter = ({ initialTimeRange, onTimeRangeChange }) => {
  const [isMobile] = useMediaQuery("(max-width: 768px)"); // Adjust the breakpoint as needed
  const [selectedTimeRange, setSelectedTimeRange] = useState(
    initialTimeRange || "thisWeek"
  ); // Initialize with initialTimeRange prop or "thisWeek"

  const handleTimeRangeChange = (timeRange) => {
    setSelectedTimeRange(timeRange);
    onTimeRangeChange(timeRange);
  };

  return (
    <Box mb={6}>
      {isMobile ? (
        <Menu>
          <MenuButton as={Button} rightIcon={<Icon as={FaCaretDown} />}>
            <Icon as={FaCalendarAlt} mr={2} />
            Filter by Date
          </MenuButton>
          <MenuList>
            <MenuItem
              onClick={() => handleTimeRangeChange("today")}
              isActive={selectedTimeRange === "today"}
            >
              Today
            </MenuItem>
            <MenuItem
              onClick={() => handleTimeRangeChange("thisWeek")}
              isActive={selectedTimeRange === "thisWeek"}
            >
              This Week
            </MenuItem>
            <MenuItem
              onClick={() => handleTimeRangeChange("thisMonth")}
              isActive={selectedTimeRange === "thisMonth"}
            >
              This Month
            </MenuItem>
            <MenuItem
              onClick={() => handleTimeRangeChange("thisYear")}
              isActive={selectedTimeRange === "thisYear"}
            >
              This Year
            </MenuItem>
            <MenuItem
              onClick={() => handleTimeRangeChange("allTime")}
              isActive={selectedTimeRange === "allTime"}
            >
              All Time
            </MenuItem>
          </MenuList>
        </Menu>
      ) : (
        <>
          <Button
            mr={2}
            onClick={() => handleTimeRangeChange("today")}
            isActive={selectedTimeRange === "today"}
          >
            Today
          </Button>
          <Button
            mr={2}
            onClick={() => handleTimeRangeChange("thisWeek")}
            isActive={selectedTimeRange === "thisWeek"}
          >
            This Week
          </Button>
          <Button
            mr={2}
            onClick={() => handleTimeRangeChange("thisMonth")}
            isActive={selectedTimeRange === "thisMonth"}
          >
            This Month
          </Button>
          <Button
            mr={2}
            onClick={() => handleTimeRangeChange("thisYear")}
            isActive={selectedTimeRange === "thisYear"}
          >
            This Year
          </Button>
          <Button
            onClick={() => handleTimeRangeChange("allTime")}
            isActive={selectedTimeRange === "allTime"}
          >
            All Time
          </Button>
        </>
      )}
    </Box>
  );
};

export default TimeRangeFilter;
