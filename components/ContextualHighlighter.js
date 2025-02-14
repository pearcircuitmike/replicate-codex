import React, { useState, useRef, useEffect } from "react";
import { Box, Button, Portal } from "@chakra-ui/react";
import { fromRange } from "dom-anchor-text-quote";

const ContextualHighlighter = ({ children, onHighlight }) => {
  const containerRef = useRef(null);
  const [popover, setPopover] = useState(null);

  const computePopoverPosition = (range) => {
    const selection = window.getSelection();
    const selectedRange = selection.getRangeAt(0);
    const bounds = selectedRange.getBoundingClientRect();

    // With position: fixed, we use viewport coordinates directly
    const left = bounds.left + bounds.width / 2;
    const top = bounds.top; // Position above the selection

    return {
      left,
      top,
      pos: bounds.top < 50 ? "below" : "above",
    };
  };

  const handleMouseUp = () => {
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed) {
      setPopover(null);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      setPopover(null);
      return;
    }

    try {
      const anchor = fromRange(containerRef.current, range);
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
    document.addEventListener("touchend", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  return (
    <Box position="relative" ref={containerRef}>
      {children}
      {popover && (
        <Portal>
          <Box
            position="fixed"
            left={`${popover.left}px`}
            top={`${popover.top}px`}
            transform={`translate(-50%, ${
              popover.pos === "above" ? "-100%" : "100%"
            })`}
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
              [popover.pos === "above" ? "bottom" : "top"]: "-5px",
              transform: "translateX(-50%)",
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              [popover.pos === "above" ? "borderTop" : "borderBottom"]:
                "6px solid white",
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
          </Box>
        </Portal>
      )}
    </Box>
  );
};

export default ContextualHighlighter;
