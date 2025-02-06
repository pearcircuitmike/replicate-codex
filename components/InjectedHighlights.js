// InjectedHighlights.jsx
import React, { useLayoutEffect } from "react";
import { toRange } from "dom-anchor-text-quote";
import { hashStringToRgba } from "@/utils/hashColor";

// Helper to normalize whitespace for text comparisons.
const normalizeText = (text) => text.replace(/\s+/g, " ").trim();

const InjectedHighlights = ({ containerRef, highlights, onHighlightClick }) => {
  useLayoutEffect(() => {
    if (!containerRef.current) {
      console.log("Container ref is not available.");
      return;
    }
    const container = containerRef.current;
    console.log("Container found:", container);

    // Remove any previously injected <mark> elements.
    const existingMarks = container.querySelectorAll("mark[data-highlight-id]");
    existingMarks.forEach((mark) => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      parent.normalize();
    });

    // Remove any previous full-element highlights (if applied directly).
    const fullHighlights = container.querySelectorAll(
      "[data-full-element-highlight='true']"
    );
    fullHighlights.forEach((el) => {
      el.style.removeProperty("background-color");
      el.removeAttribute("data-full-element-highlight");
      el.removeAttribute("data-highlight-id");
      el.removeAttribute("data-user-id");
    });

    // Use a higher base opacity so the highlight is clearly visible.
    const baseAlpha = 0.4;
    const hoverAlpha = 0.6;

    // Process highlights (sorted by quote length descending so longer quotes get processed first).
    const sortedHighlights = [...highlights].sort(
      (a, b) => b.quote.length - a.quote.length
    );
    console.log("Sorted highlights:", sortedHighlights);

    sortedHighlights.forEach((hl) => {
      console.log("Processing highlight:", hl);
      try {
        const range = toRange(container, {
          exact: hl.quote,
          prefix: hl.prefix,
          suffix: hl.suffix,
        });
        if (!range) {
          console.warn("No range found for highlight:", hl);
          return;
        }
        console.log("Found range:", range);

        // Generate the colors.
        const normalColor = hashStringToRgba(hl.user_id, baseAlpha);
        const hoverColor = hashStringToRgba(hl.user_id, hoverAlpha);

        // Identify a candidate block element.
        let blockEl = range.commonAncestorContainer;
        if (blockEl.nodeType === 3) {
          blockEl = blockEl.parentNode;
        }
        console.log("Candidate block element:", blockEl);

        // Create a range spanning the entire block element.
        const fullRange = document.createRange();
        fullRange.selectNodeContents(blockEl);
        const fullText = normalizeText(fullRange.toString());
        const selectedText = normalizeText(range.toString());
        console.log("Full element text:", fullText);
        console.log("Selected text:", selectedText);

        const isFullElement = fullText === selectedText;
        console.log("Is full element highlight:", isFullElement);

        if (isFullElement) {
          // For full-element highlights, apply styles directly to the element.
          blockEl.style.setProperty(
            "background-color",
            normalColor,
            "important"
          );
          blockEl.style.cursor = "pointer";
          blockEl.style.transition = "background-color 0.2s ease";
          blockEl.setAttribute("data-full-element-highlight", "true");
          blockEl.setAttribute("data-highlight-id", hl.id);
          blockEl.setAttribute("data-user-id", hl.user_id);
          blockEl.title = `${hl.is_comment ? "Comment" : "Highlight"} by ${
            hl.user_profile?.full_name ||
            hl.user_profile?.username ||
            "Anonymous"
          }`;

          const onMouseEnter = () => {
            blockEl.style.setProperty(
              "background-color",
              hoverColor,
              "important"
            );
          };
          const onMouseLeave = () => {
            blockEl.style.setProperty(
              "background-color",
              normalColor,
              "important"
            );
          };
          const onClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            onHighlightClick?.(hl);
          };
          blockEl.addEventListener("mouseenter", onMouseEnter);
          blockEl.addEventListener("mouseleave", onMouseLeave);
          blockEl.addEventListener("click", onClick);
        } else {
          // For partial selections, wrap the selected content in a <mark> element.
          const mark = document.createElement("mark");
          // Force the background color and display styles with !important.
          mark.style.setProperty("background-color", normalColor, "important");
          mark.style.setProperty("display", "inline", "important");
          mark.style.setProperty(
            "transition",
            "background-color 0.2s",
            "important"
          );
          mark.style.cursor = "pointer";
          mark.setAttribute("data-highlight-id", hl.id);
          mark.setAttribute("data-user-id", hl.user_id);
          mark.title = `${hl.is_comment ? "Comment" : "Highlight"} by ${
            hl.user_profile?.full_name ||
            hl.user_profile?.username ||
            "Anonymous"
          }`;

          mark.addEventListener("mouseenter", () => {
            mark.style.setProperty("background-color", hoverColor, "important");
          });
          mark.addEventListener("mouseleave", () => {
            mark.style.setProperty(
              "background-color",
              normalColor,
              "important"
            );
          });
          mark.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            onHighlightClick?.(hl);
          });

          // Extract and insert the selected content.
          const contents = range.extractContents();
          mark.appendChild(contents);
          range.insertNode(mark);
          console.log("Inserted inline mark:", mark);

          // If the inserted mark contains any block-level children (e.g. an <h2>), force their background color as well.
          Array.from(mark.children).forEach((child) => {
            // You could check for specific tag names if desired.
            child.style.setProperty(
              "background-color",
              normalColor,
              "important"
            );
          });
        }
      } catch (err) {
        console.error("Error processing highlight:", hl, err);
      }
    });
  }, [containerRef, highlights, onHighlightClick]);

  return null;
};

export default InjectedHighlights;
