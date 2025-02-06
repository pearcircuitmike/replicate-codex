// components/TextHighlighter.js
import React, { useState, useEffect, useRef } from "react";
import { Box, Button } from "@chakra-ui/react";
import supabase from "@/pages/api/utils/supabaseClient";
import { fromRange } from "xpath-range";

const PREFIX_LENGTH = 20; // not used for fallback now
const SUFFIX_LENGTH = 20; // not used for fallback now

/**
 * Computes the absolute character offset (in container.innerText)
 * for the given target node and offset.
 */
function getAbsoluteOffset(container, targetNode, offsetInNode) {
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  let absoluteOffset = 0;
  let currentNode;
  while ((currentNode = walker.nextNode())) {
    if (currentNode === targetNode) {
      return absoluteOffset + offsetInNode;
    }
    absoluteOffset += currentNode.textContent.length;
  }
  return absoluteOffset;
}

const TextHighlighter = ({
  paperId,
  user,
  onComment,
  onNewHighlight,
  children,
}) => {
  const containerRef = useRef(null);
  const [selectionData, setSelectionData] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);

  const handleMouseUp = (e) => {
    if (e.target.closest(".context-menu")) return;
    const sel = window.getSelection();
    if (!sel || sel.toString().trim() === "") {
      setSelectionData(null);
      setMenuPosition(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const rangeRect = range.getBoundingClientRect();
    setMenuPosition({
      top: rangeRect.top - containerRect.top + container.scrollTop - 40,
      left: rangeRect.left - containerRect.left + container.scrollLeft,
    });
    // Use fromRange to get XPath info relative to container.
    const rangeData = fromRange(range, container);
    const selectedText = sel.toString().trim();
    const absStartOffset = getAbsoluteOffset(
      container,
      range.startContainer,
      range.startOffset
    );
    setSelectionData({
      start: rangeData.start, // stored as start_xpath
      end: rangeData.end, // stored as end_xpath
      startOffset: rangeData.startOffset,
      endOffset: rangeData.endOffset,
      selectedText,
      absoluteOffset: absStartOffset,
      highlightLength: selectedText.length,
    });
  };

  useEffect(() => {
    const node = containerRef.current;
    if (node) node.addEventListener("mouseup", handleMouseUp);
    return () => {
      if (node) node.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const saveHighlight = async (data) => {
    if (!user || !data) return null;
    try {
      const { data: inserted, error } = await supabase
        .from("highlights")
        .insert([
          {
            user_id: user.id,
            paper_id: paperId,
            highlight_text: data.selectedText,
            start_xpath: data.start,
            end_xpath: data.end,
            start_offset: data.startOffset,
            end_offset: data.endOffset,
            absolute_offset: data.absoluteOffset,
            highlight_length: data.highlightLength,
          },
        ])
        .select(
          `
          *,
          public_profile_info:profiles (id, full_name, avatar_url, username)
        `
        )
        .single();
      if (error) {
        console.error("Error saving highlight:", error);
        return null;
      }
      if (onNewHighlight) onNewHighlight(inserted);
      return inserted;
    } catch (err) {
      console.error("Exception in saveHighlight:", err);
      return null;
    }
  };

  const handleHighlight = async (e) => {
    e.stopPropagation();
    if (!selectionData) return;
    await saveHighlight(selectionData);
    window.getSelection().removeAllRanges();
    setSelectionData(null);
    setMenuPosition(null);
  };

  const handleComment = async (e) => {
    e.stopPropagation();
    if (!selectionData) return;
    const inserted = await saveHighlight(selectionData);
    if (inserted && onComment) onComment(selectionData.selectedText);
    window.getSelection().removeAllRanges();
    setSelectionData(null);
    setMenuPosition(null);
  };

  return (
    <Box position="relative" ref={containerRef}>
      {children}
      {menuPosition && (
        <Box
          className="context-menu"
          position="absolute"
          top={menuPosition.top}
          left={menuPosition.left}
          bg="white"
          border="1px solid #ddd"
          borderRadius="4px"
          p={2}
          boxShadow="sm"
          zIndex={1000}
        >
          <Button size="sm" onClick={handleHighlight} mr={2}>
            Highlight
          </Button>
          <Button size="sm" onClick={handleComment}>
            Comment
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TextHighlighter;
