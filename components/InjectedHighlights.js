// components/InjectedHighlights.js
import React, { useEffect } from "react";
import { toRange } from "xpath-range";
import { hashStringToRgba } from "@/utils/hashColor";

/**
 * Fallback: Reconstruct a Range from an absolute offset and highlight length.
 */
function getRangeFromAbsoluteOffset(container, absOffset, length) {
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  let cumulative = 0;
  let currentNode;
  const range = document.createRange();
  let foundStart = false;
  while ((currentNode = walker.nextNode())) {
    const nodeLength = currentNode.textContent.length;
    if (!foundStart && cumulative + nodeLength >= absOffset) {
      const offsetInNode = absOffset - cumulative;
      range.setStart(currentNode, offsetInNode);
      foundStart = true;
    }
    if (foundStart && cumulative + nodeLength >= absOffset + length) {
      const offsetInNode = absOffset + length - cumulative;
      range.setEnd(currentNode, offsetInNode);
      return range;
    }
    cumulative += nodeLength;
  }
  return null;
}

const InjectedHighlights = ({ containerRef, highlights }) => {
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    highlights.forEach((hl) => {
      let range = null;
      try {
        range = toRange(
          hl.start_xpath,
          hl.start_offset,
          hl.end_xpath,
          hl.end_offset,
          container
        );
      } catch (err) {
        console.warn("XPath reconstruction failed:", err);
      }
      if (!range && hl.absolute_offset != null && hl.highlight_length != null) {
        range = getRangeFromAbsoluteOffset(
          container,
          hl.absolute_offset,
          hl.highlight_length
        );
      }
      if (range) {
        try {
          const mark = document.createElement("mark");
          mark.style.backgroundColor = hashStringToRgba(hl.user_id, 0.5);
          mark.title = `highlighted by ${
            hl.public_profile_info?.full_name || "unknown"
          }`;
          // Add a data attribute for positioning the sidebar annotation.
          mark.setAttribute("data-highlight-id", hl.id);
          const extracted = range.extractContents();
          mark.appendChild(extracted);
          range.insertNode(mark);
        } catch (err) {
          console.error("Error injecting highlight:", err);
        }
      } else {
        console.warn("Could not find range for highlight:", hl.highlight_text);
      }
    });
  }, [containerRef, highlights]);
  return null;
};

export default InjectedHighlights;
