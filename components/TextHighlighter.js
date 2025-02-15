import React, { useState, useRef, useEffect } from "react";
import { Box, Button, Portal } from "@chakra-ui/react";
import { fromRange, toRange } from "dom-anchor-text-quote";

const ContextualHighlighter = ({
  children,
  onHighlight,
  onComment,
  highlights = [],
  containerRef,
}) => {
  const highlighterRef = useRef(null);
  const [popover, setPopover] = useState(null);
  const [activeHighlight, setActiveHighlight] = useState(null);

  const computePopoverPosition = (range) => {
    const rects = range.getClientRects();
    if (!rects.length) return null;

    const rect = rects[0];
    const left = rect.left + rect.width / 2;
    const top = rect.top - 10;

    return {
      left: left + window.scrollX,
      top: top + window.scrollY,
      pos: "above",
    };
  };

  const handleMouseUp = () => {
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed) {
      setPopover(null);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!highlighterRef.current.contains(range.commonAncestorContainer)) {
      setPopover(null);
      return;
    }

    try {
      const anchor = fromRange(highlighterRef.current, range);
      if (!anchor || !anchor.exact || anchor.exact.trim() === "") {
        setPopover(null);
        return;
      }

      const pos = computePopoverPosition(range);
      if (pos) {
        setPopover({ ...pos, anchor });
      }
    } catch (err) {
      console.error("Error computing highlight position:", err);
      setPopover(null);
    }
  };

  const clearSelection = () => {
    if (document.getSelection) {
      document.getSelection().removeAllRanges();
    }
    setPopover(null);
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <Box position="relative" ref={highlighterRef}>
      {children}
      {popover && (
        <Portal>
          <Box
            position="absolute"
            left={`${popover.left}px`}
            top={`${popover.top}px`}
            transform="translate(-50%, -100%)"
            bg="white"
            boxShadow="md"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            p={2}
            zIndex={1000}
            display="flex"
            gap={2}
            _after={{
              content: '""',
              position: "absolute",
              left: "50%",
              bottom: "-5px",
              transform: "translateX(-50%)",
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid white",
            }}
          >
            <Button
              size="sm"
              colorScheme="blue"
              variant="ghost"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onHighlight(popover.anchor);
                clearSelection();
              }}
            >
              Highlight
            </Button>
            <Button
              size="sm"
              colorScheme="green"
              variant="ghost"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onComment(popover.anchor);
                clearSelection();
              }}
            >
              Comment
            </Button>
          </Box>
        </Portal>
      )}
    </Box>
  );
};

export default ContextualHighlighter;
