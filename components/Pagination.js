import React from "react";
import NextLink from "next/link";
import { Box, Button, HStack, Text } from "@chakra-ui/react";

/**
 * Create a list of page numbers (and "dots") around the current page.
 * Always includes 1 and the last page.
 */
function getPageRange(current, total, windowSize = 2) {
  const pages = new Set([1, total]);

  for (let i = current - windowSize; i <= current + windowSize; i++) {
    if (i > 1 && i < total) {
      pages.add(i);
    }
  }

  const sortedPages = [...pages].sort((a, b) => a - b);

  const finalRange = [];
  for (let i = 0; i < sortedPages.length; i++) {
    const pageNum = sortedPages[i];
    const prevPage = sortedPages[i - 1];

    if (i > 0 && pageNum - prevPage > 1) {
      finalRange.push("dots");
    }
    finalRange.push(pageNum);
  }
  return finalRange;
}

/**
 * Windowed, SEO-friendly Pagination
 *
 * Props:
 * - totalCount     (number)  : total items
 * - pageSize       (number)  : items per page
 * - currentPage    (number)
 * - onPageChange   (function): callback when user clicks a page
 * - basePath       (string)  : the route, e.g. "/models" or "/papers"
 * - extraQuery     (object)  : additional query params, e.g. searchValue
 * - windowSize     (number)  : how many pages to show around current
 */
const Pagination = ({
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
  basePath,
  extraQuery = {},
  windowSize = 2,
}) => {
  const pageCount = Math.ceil(totalCount / pageSize);
  if (pageCount <= 1) return null;

  // Generate the windowed list of pages
  const pages = getPageRange(currentPage, pageCount, windowSize);

  const handlePageClick = (page) => {
    if (page !== "dots" && typeof onPageChange === "function") {
      onPageChange(page);
    }
  };

  return (
    <Box mt={4}>
      <HStack wrap="wrap" justify="center" spacing={2}>
        {/* Previous Button */}
        {currentPage > 1 && (
          <NextLink
            href={{
              pathname: basePath,
              query: { ...extraQuery, page: currentPage - 1 },
            }}
            passHref
          >
            <Button onClick={() => handlePageClick(currentPage - 1)}>
              Previous
            </Button>
          </NextLink>
        )}

        {/* Page Buttons */}
        {pages.map((p, idx) => {
          if (p === "dots") {
            return <Text key={`dots-${idx}`}>…</Text>;
          }
          return (
            <NextLink
              key={`page-${p}`}
              href={{ pathname: basePath, query: { ...extraQuery, page: p } }}
              passHref
            >
              <Button
                onClick={() => handlePageClick(p)}
                colorScheme={p === currentPage ? "teal" : "gray"}
              >
                {p}
              </Button>
            </NextLink>
          );
        })}

        {/* Next Button */}
        {currentPage < pageCount && (
          <NextLink
            href={{
              pathname: basePath,
              query: { ...extraQuery, page: currentPage + 1 },
            }}
            passHref
          >
            <Button onClick={() => handlePageClick(currentPage + 1)}>
              Next
            </Button>
          </NextLink>
        )}
      </HStack>
    </Box>
  );
};

export default Pagination;
