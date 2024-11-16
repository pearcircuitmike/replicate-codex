import React, { useEffect, useState } from "react";
import { Box, Button, VStack, useBreakpointValue } from "@chakra-ui/react";

const extractSections = (markdownContent) => {
  if (!markdownContent) return [];

  // Extract headers from markdown content
  const headerRegex = /^## (.*$)/gm;
  const matches = [...markdownContent.matchAll(headerRegex)];

  // Create sections from markdown headers
  const markdownSections = matches.map((match, index) => ({
    id: match[1].toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-"),
    title: match[1],
    index,
  }));

  // Add "Full paper" section
  const fullPaperSection = {
    id: "full-paper",
    title: "Full Paper",
    index: markdownSections.length, // Put it at the end
  };

  // Combine markdown sections with full paper section
  return [...markdownSections, fullPaperSection].sort(
    (a, b) => a.index - b.index
  );
};

const SideNavigation = ({ markdownContent = "" }) => {
  const [activeSection, setActiveSection] = useState("");
  const [sections, setSections] = useState([]);
  const display = useBreakpointValue({ base: "none", xl: "block" });

  useEffect(() => {
    setSections(extractSections(markdownContent));
  }, [markdownContent]);

  useEffect(() => {
    if (sections.length === 0) return;

    const updateActiveSection = () => {
      const elements = sections.map(({ id }) => document.getElementById(id));
      let currentSection = null;
      let minDistance = Infinity;

      elements.forEach((element) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const distance = Math.abs(rect.top);
          if (distance < minDistance) {
            minDistance = distance;
            currentSection = element.id;
          }
        }
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    // Initial check
    updateActiveSection();

    // Add scroll listener with passive flag for better performance
    window.addEventListener("scroll", updateActiveSection, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
    };
  }, [sections]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  if (sections.length === 0) return null;

  return (
    <Box
      as="nav"
      position="fixed"
      right="8"
      top="25%"
      width="52"
      display={display}
      zIndex="10"
      background="white"
      rounded="5px"
      py={3}
      px={1}
      boxShadow="sm"
    >
      <VStack spacing={2} align="stretch">
        {sections.map(({ id, title }) => (
          <Button
            key={id}
            onClick={() => scrollToSection(id)}
            variant="ghost"
            justifyContent="flex-start"
            size="sm"
            width="full"
            fontWeight="normal"
            px={4}
            color={activeSection === id ? "blue.600" : "gray.600"}
            bg={activeSection === id ? "blue.50" : "transparent"}
            _hover={{
              bg: activeSection === id ? "blue.100" : "gray.100",
              color: activeSection === id ? "blue.600" : "gray.900",
            }}
          >
            {title}
          </Button>
        ))}
      </VStack>
    </Box>
  );
};

export default SideNavigation;
