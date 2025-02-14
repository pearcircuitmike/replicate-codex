import React, { useLayoutEffect } from "react";
import { toRange } from "dom-anchor-text-quote";
import { hashStringToRgba } from "@/utils/hashColor";

const InjectedHighlights = ({ containerRef, highlights, onHighlightClick }) => {
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Clean up previous highlights
    cleanupHighlights(container);

    highlights.forEach((hl) => {
      try {
        const range = toRange(container, {
          exact: hl.quote,
          prefix: hl.prefix,
          suffix: hl.suffix,
        });

        if (!range) return;

        const color = hashStringToRgba(hl.user_id, 0.4);
        const hoverColor = hashStringToRgba(hl.user_id, 0.6);

        // Use our robust highlighting approach
        highlightRange(range, {
          color,
          hoverColor,
          onClick: (e) => {
            e.preventDefault();
            onHighlightClick?.(hl);
          },
        });
      } catch (err) {
        console.error("Error highlighting:", err);
      }
    });
  }, [containerRef, highlights, onHighlightClick]);

  return null;
};

function cleanupHighlights(container) {
  container.normalize();
  const marks = container.querySelectorAll("mark[data-highlight]");
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);
  });
}

function highlightRange(range, { color, hoverColor, onClick }) {
  const startNode = range.startContainer;
  const endNode = range.endContainer;
  const commonAncestor = range.commonAncestorContainer;

  // If highlighting within a single text node
  if (startNode === endNode && startNode.nodeType === Node.TEXT_NODE) {
    const span = createHighlightSpan(color, hoverColor, onClick);
    const textContent = startNode.textContent;
    const beforeText = textContent.substring(0, range.startOffset);
    const highlightedText = textContent.substring(
      range.startOffset,
      range.endOffset
    );
    const afterText = textContent.substring(range.endOffset);

    const fragment = document.createDocumentFragment();
    if (beforeText) fragment.appendChild(document.createTextNode(beforeText));

    span.textContent = highlightedText;
    fragment.appendChild(span);

    if (afterText) fragment.appendChild(document.createTextNode(afterText));

    startNode.parentNode.replaceChild(fragment, startNode);
    return;
  }

  // For complex ranges that cross element boundaries
  const iterator = document.createNodeIterator(
    commonAncestor,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const nodeRange = document.createRange();
        nodeRange.selectNodeContents(node);

        if (range.intersectsNode(node)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      },
    }
  );

  const nodesToHighlight = [];
  let currentNode;

  while ((currentNode = iterator.nextNode())) {
    const nodeRange = document.createRange();
    nodeRange.selectNodeContents(currentNode);

    if (range.intersectsNode(currentNode)) {
      const intersectionStart = Math.max(
        0,
        currentNode === startNode ? range.startOffset : 0
      );
      const intersectionEnd = Math.min(
        currentNode.length,
        currentNode === endNode ? range.endOffset : currentNode.length
      );

      if (intersectionStart !== intersectionEnd) {
        nodesToHighlight.push({
          node: currentNode,
          start: intersectionStart,
          end: intersectionEnd,
        });
      }
    }
  }

  // Apply highlights in reverse order to maintain position validity
  nodesToHighlight.reverse().forEach(({ node, start, end }) => {
    const span = createHighlightSpan(color, hoverColor, onClick);
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, end);

    const textContent = range.extractContents();
    span.appendChild(textContent);
    range.insertNode(span);
  });
}

function createHighlightSpan(color, hoverColor, onClick) {
  const span = document.createElement("mark");
  span.setAttribute("data-highlight", "true");
  span.style.backgroundColor = color;
  span.style.color = "inherit";
  span.style.cursor = "pointer";
  span.style.mixBlendMode = "multiply"; // For overlapping highlights

  span.addEventListener("mouseenter", () => {
    span.style.backgroundColor = hoverColor;
  });

  span.addEventListener("mouseleave", () => {
    span.style.backgroundColor = color;
  });

  if (onClick) {
    span.addEventListener("click", onClick);
  }

  return span;
}

export default InjectedHighlights;
