import React, { useLayoutEffect } from "react";
import { toRange } from "dom-anchor-text-quote";
import { hashStringToRgba } from "@/utils/hashColor";

const InjectedHighlights = ({ containerRef, highlights, onHighlightClick }) => {
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Remove previous highlight marks.
    const marks = container.querySelectorAll("mark[data-highlight]");
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
    });

    highlights.forEach((hl) => {
      try {
        // Create a range using the dom-anchor-text-quote library.
        const range = toRange(container, {
          exact: hl.quote,
          prefix: hl.prefix,
          suffix: hl.suffix,
        });
        if (!range) return;

        // Compute colors.
        const color = hashStringToRgba(hl.user_id, 0.4);
        const hoverColor = hashStringToRgba(hl.user_id, 0.6);

        // Split the range into sub-ranges. This handles cases where
        // the selection spans more than one text node (or DOM element).
        const subRanges = getSubRanges(range);
        // Process the sub-ranges in reverse order. That way, DOM changes in one
        // part do not affect the others.
        subRanges.reverse().forEach((subRange) => {
          const mark = document.createElement("mark");
          mark.style.setProperty("background-color", color, "important");
          mark.style.setProperty("color", "inherit", "important");
          mark.style.setProperty("cursor", "pointer", "important");
          mark.setAttribute("data-highlight", "true");

          mark.addEventListener("mouseenter", () => {
            mark.style.backgroundColor = hoverColor;
          });
          mark.addEventListener("mouseleave", () => {
            mark.style.backgroundColor = color;
          });
          mark.addEventListener("click", (e) => {
            e.preventDefault();
            onHighlightClick?.(hl);
          });

          // Wrap the selected portion.
          mark.appendChild(subRange.extractContents());
          subRange.insertNode(mark);
        });
      } catch (err) {
        console.error("Error:", err);
      }
    });
  }, [containerRef, highlights, onHighlightClick]);

  // This helper function returns an array of ranges that each lie
  // within a single text node. It computes the intersection of the
  // original range with each text node inside the common ancestor.
  function getSubRanges(range) {
    const subRanges = [];
    const commonAncestor = range.commonAncestorContainer;
    const walker = document.createTreeWalker(
      commonAncestor,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          // Check if the text node intersects the highlight range.
          const nodeRange = document.createRange();
          nodeRange.selectNodeContents(node);
          if (
            range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0 &&
            range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0
          ) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        },
      }
    );

    // Iterate over all text nodes that intersect the range.
    let textNode;
    while ((textNode = walker.nextNode())) {
      const nodeRange = document.createRange();
      nodeRange.selectNodeContents(textNode);
      // Set the start to the original range start if this is the start node.
      const start = textNode === range.startContainer ? range.startOffset : 0;
      // Set the end to the original range end if this is the end node.
      const end =
        textNode === range.endContainer
          ? range.endOffset
          : textNode.textContent.length;

      if (start !== end) {
        const subRange = document.createRange();
        subRange.setStart(textNode, start);
        subRange.setEnd(textNode, end);
        subRanges.push(subRange);
      }
    }
    return subRanges;
  }

  return null;
};

export default InjectedHighlights;
