import React, { useEffect, useState } from "react";
import { Box, Button, VStack, useBreakpointValue } from "@chakra-ui/react";

const extractSections = (markdownContent) => {
  if (!markdownContent) return [];

  // Match all headers starting with ## (h2 headers)
  const headerRegex = /^## (.*$)/gm;
  const matches = [...markdownContent.matchAll(headerRegex)];

  return matches
    .map((match, index) => ({
      id: match[1].toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-"),
      title: match[1],
      // Store the original index to maintain order
      index,
    }))
    .sort((a, b) => a.index - b.index);
};

const SideNavigation = ({ markdownContent = "" }) => {
  const [activeSection, setActiveSection] = useState("");
  const [sections, setSections] = useState([]);

  // Only show on desktop
  const display = useBreakpointValue({ base: "none", xl: "block" });

  useEffect(() => {
    setSections(extractSections(markdownContent));
  }, [markdownContent]);

  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -80% 0px",
      }
    );

    // Observe all section elements
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (sections.length === 0) return null;

  return (
    <Box
      as="nav"
      position="fixed"
      right="8"
      top="32"
      width="48"
      display={display}
      zIndex="10"
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
