// components/HighlightSidebar.js
import React, { useEffect, useState } from "react";
import { Box, Avatar, Text } from "@chakra-ui/react";

const HighlightSidebar = ({ containerRef, highlights }) => {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const newPositions = highlights
      .map((hl) => {
        const mark = containerRef.current.querySelector(
          `[data-highlight-id="${hl.id}"]`
        );
        if (mark) {
          const markRect = mark.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          return {
            id: hl.id,
            top: markRect.top - containerRect.top,
            highlight: hl,
          };
        }
        return null;
      })
      .filter((pos) => pos !== null);
    setPositions(newPositions);
  }, [containerRef, highlights]);

  return (
    <Box position="relative" height="100%">
      {positions.map(({ id, top, highlight }) => (
        <Box
          key={id}
          position="absolute"
          top={top}
          right={0}
          p={1}
          background="white"
        >
          <Text fontSize="sm" whiteSpace="nowrap">
            highlighted by{" "}
            {highlight.public_profile_info?.full_name || "unknown"}
          </Text>
          <Avatar
            size="xs"
            src={highlight.public_profile_info?.avatar_url}
            ml={1}
          />
        </Box>
      ))}
    </Box>
  );
};

export default HighlightSidebar;
