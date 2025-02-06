// components/HighlightedSummary.js
import React from "react";
import { Box, Avatar, Text } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import customTheme from "@/components/MarkdownTheme";
import { hashStringToRgba } from "@/utils/hashColor";

const HighlightedSummary = ({ summary, highlights }) => {
  // NOTE: The stored offsets were computed from the plain text version of the summary.
  // We assume that the plain text is nearly identical to the markdown source.
  const sortedHighlights = [...highlights].sort(
    (a, b) => a.start_offset - b.start_offset
  );
  const segments = [];
  let lastIndex = 0;

  // Split the markdown source based on offsets.
  sortedHighlights.forEach((hl) => {
    if (hl.start_offset > lastIndex) {
      segments.push({
        text: summary.substring(lastIndex, hl.start_offset),
        highlighted: false,
      });
    }
    segments.push({
      text: summary.substring(hl.start_offset, hl.end_offset),
      highlighted: true,
      highlight: hl,
    });
    lastIndex = hl.end_offset;
  });
  if (lastIndex < summary.length) {
    segments.push({ text: summary.substring(lastIndex), highlighted: false });
  }

  return (
    <Box>
      {segments.map((seg, idx) => {
        if (!seg.highlighted) {
          return (
            <Box key={idx} display="inline">
              <ReactMarkdown components={ChakraUIRenderer(customTheme)}>
                {seg.text}
              </ReactMarkdown>
            </Box>
          );
        } else {
          const hl = seg.highlight;
          return (
            <Box
              key={idx}
              position="relative"
              display="inline-block"
              bg={hashStringToRgba(hl.user_id, 0.5)}
              px="1"
              borderRadius="2px"
              mr="1"
            >
              <ReactMarkdown components={ChakraUIRenderer(customTheme)}>
                {seg.text}
              </ReactMarkdown>
              {/* The annotation is positioned in the right gutter */}
              <Box
                position="absolute"
                top="0"
                right="-110px"
                whiteSpace="nowrap"
                fontSize="xs"
                color="gray.600"
                display="flex"
                alignItems="center"
              >
                <Avatar
                  size="xs"
                  src={hl.public_profile_info?.avatar_url}
                  name={hl.public_profile_info?.full_name}
                  mr={1}
                />
                <Text>highlighted by</Text>
              </Box>
            </Box>
          );
        }
      })}
    </Box>
  );
};

export default HighlightedSummary;
