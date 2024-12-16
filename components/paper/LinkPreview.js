import React, { useState } from "react";
import { Box, Link, Text, Flex, Image, Portal } from "@chakra-ui/react";

const LinkPreview = ({ href, children }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [pageTitle, setPageTitle] = useState("");

  let urlDisplay = "";
  try {
    const url = new URL(href);
    urlDisplay = url.hostname;
  } catch (e) {
    // Invalid URL, ignore
  }

  const handleMouseEnter = (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const previewWidth = 320; // 80% of 400px
    const previewHeight = 240; // 80% of 300px

    let left = mouseX;
    let top = mouseY + 20;

    if (left + previewWidth > viewportWidth - 20) {
      left = viewportWidth - previewWidth - 20;
    }

    if (top + previewHeight > viewportHeight - 20) {
      top = mouseY - previewHeight - 10;
    }

    setPosition({
      top: top + window.scrollY,
      left: left + window.scrollX,
    });
    setShowPreview(true);
  };

  const getTitle = (href) => {
    if (href.includes("/papers/arxiv/")) {
      const slug = href.split("/").pop();
      // Replace hyphens with spaces and convert to Title Case
      return slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
    return urlDisplay;
  };

  return (
    <Box display="inline">
      <Link
        href={href}
        color="blue.500"
        _hover={{ color: "blue.600", textDecoration: "underline" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={(e) => {
          const toElement = e.relatedTarget;
          const isMovingToPreview = toElement?.closest(
            '[data-preview-box="true"]'
          );
          if (!isMovingToPreview) {
            setShowPreview(false);
            setPageTitle("");
          }
        }}
      >
        {children}
      </Link>

      {showPreview && (
        <Portal>
          <Box
            data-preview-box="true"
            position="fixed"
            top={position.top}
            left={position.left}
            zIndex={99999}
            width="320px"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            boxShadow="lg"
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => {
              setShowPreview(false);
              setPageTitle("");
            }}
          >
            <Box
              height="160px"
              borderBottomWidth="1px"
              borderColor="gray.100"
              overflow="hidden"
              position="relative"
            >
              <Image
                src="https://cdn.dribbble.com/users/63554/screenshots/10844959/media/d6e4f9ccef4cce39198a4b958d0cb47f.jpg"
                alt="Preview fallback"
                width="100%"
                height="100%"
                objectFit="cover"
              />
            </Box>
            <Box p={3}>
              {" "}
              {/* Adjusted padding for smaller size */}
              <Flex alignItems="center" gap={2}>
                <Image
                  src={`https://www.google.com/s2/favicons?domain=${urlDisplay}&sz=32`}
                  alt=""
                  width="16px"
                  height="16px"
                />
                <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                  {href.includes("/papers/arxiv/")
                    ? getTitle(href)
                    : pageTitle || urlDisplay}
                </Text>
              </Flex>
            </Box>
          </Box>
        </Portal>
      )}
    </Box>
  );
};

export default LinkPreview;
