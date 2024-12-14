// components/paper/SectionsNav.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  VStack,
  useBreakpointValue,
  Icon,
} from "@chakra-ui/react";
import { FaBookmark } from "react-icons/fa";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButton from "@/components/ShareButton";

const extractSections = (markdownContent) => {
  if (!markdownContent) return [];
  const headerRegex = /^## (.*$)/gm;
  const matches = [...markdownContent.matchAll(headerRegex)];
  const markdownSections = matches.map((match, index) => ({
    id: match[1].toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-"),
    title: match[1],
    index,
  }));
  const fullPaperSection = {
    id: "full-paper",
    title: "Full Paper",
    index: markdownSections.length,
  };
  return [...markdownSections, fullPaperSection].sort(
    (a, b) => a.index - b.index
  );
};

const SectionsNav = ({ markdownContent = "", paper }) => {
  const [activeSection, setActiveSection] = useState("");
  const [sections, setSections] = useState([]);
  const display = useBreakpointValue({ base: "none", xl: "block" });

  useEffect(() => {
    setSections(extractSections(markdownContent));
  }, [markdownContent]);

  useEffect(() => {
    if (sections.length === 0) return;

    const mainContent = document.getElementById("main-content");
    if (!mainContent) return;

    const updateActiveSection = () => {
      const elements = sections.map(({ id }) => document.getElementById(id));
      let currentSection = null;
      let minDistance = Infinity;
      elements.forEach((element) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const distance = Math.abs(
            rect.top - mainContent.getBoundingClientRect().top
          );
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

    updateActiveSection();
    mainContent.addEventListener("scroll", updateActiveSection, {
      passive: true,
    });
    return () => {
      mainContent.removeEventListener("scroll", updateActiveSection);
    };
  }, [sections]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    const mainContent = document.getElementById("main-content");
    if (element && mainContent) {
      const elementPosition = element.offsetTop;
      mainContent.scrollTo({
        top: elementPosition - 20,
        behavior: "smooth",
      });
      setActiveSection(sectionId);
    }
  };

  if (sections.length === 0) return null;

  return (
    <Box as="nav" py={3} px={1}>
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

      <VStack spacing={2} mt={6} align="stretch">
        <BookmarkButton resourceId={paper.id} resourceType="paper" />

        <Button onClick={() => {}} size="sm" width="full" variant="outline">
          Share on 𝕏
        </Button>
      </VStack>
    </Box>
  );
};

export default SectionsNav;
