// components/HighlightOverlays.js
import React, { useEffect, useState } from "react";
import { Box, Avatar, Text, Tooltip } from "@chakra-ui/react";
import { hashStringToRgba } from "@/utils/hashColor";

// Helper: Given a container and character offsets, returns a Range.
function getRangeForOffsets(container, start, end) {
  const range = document.createRange();
  let charIndex = 0;
  let startNode = null;
  let startOffset = 0;
  let endNode = null;
  let endOffset = 0;

  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const textLength = node.textContent.length;
      if (!startNode && charIndex + textLength >= start) {
        startNode = node;
        startOffset = start - charIndex;
      }
      if (!endNode && charIndex + textLength >= end) {
        endNode = node;
        endOffset = end - charIndex;
      }
      charIndex += textLength;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        traverse(node.childNodes[i]);
        if (endNode) break;
      }
    }
  }
  traverse(container);
  if (startNode && endNode) {
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
  }
  return range;
}

const HighlightOverlays = ({ containerRef, highlights }) => {
  const [overlays, setOverlays] = useState([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const newOverlays = [];
    highlights.forEach((hl) => {
      const range = getRangeForOffsets(
        containerRef.current,
        hl.start_offset,
        hl.end_offset
      );
      if (!range) return;
      // Get bounding rectangles (there may be multiple lines)
      const rects = Array.from(range.getClientRects()).map((rect) => ({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      }));
      newOverlays.push({ id: hl.id, rects, highlight: hl });
    });
    setOverlays(newOverlays);
  }, [containerRef, highlights]);

  return (
    <>
      {overlays.map(({ id, rects, highlight }) =>
        rects.map((rect, idx) => (
          <Box
            key={`${id}-${idx}`}
            position="absolute"
            top={rect.top}
            left={rect.left}
            width={rect.width}
            height={rect.height}
            backgroundColor={hashStringToRgba(highlight.user_id, 0.5)}
            pointerEvents="none"
            borderRadius="2px"
          >
            {/* For the first rect, add a tooltip icon in the right gutter */}
            {idx === 0 && (
              <Tooltip
                label={
                  <Box display="flex" alignItems="center">
                    <Avatar
                      size="xs"
                      src={highlight.public_profile_info?.avatar_url}
                      mr={1}
                    />
                    <Text fontSize="xs">highlighted by</Text>
                  </Box>
                }
                placement="right"
                hasArrow
              >
                <Box
                  position="absolute"
                  top={-rect.height / 2}
                  right={-40}
                  pointerEvents="auto"
                  cursor="default"
                >
                  <Avatar
                    size="xs"
                    src={highlight.public_profile_info?.avatar_url}
                  />
                </Box>
              </Tooltip>
            )}
          </Box>
        ))
      )}
    </>
  );
};

export default HighlightOverlays;
