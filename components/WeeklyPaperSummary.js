import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  Heading,
  Stack,
  useToast,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import customTheme from "@/components/MarkdownTheme";
import { CopyIcon } from "@chakra-ui/icons";

const WeeklySummary = () => {
  const [summary, setSummary] = useState(null);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const toast = useToast();
  const contentRef = useRef(null);

  const fetchSummary = async () => {
    try {
      const response = await fetch(
        `/api/weekly-summaries-papers?offset=${offset}`
      );
      const data = await response.json();
      setSummary(data.data);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error("Error fetching weekly summary:", error);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [offset]);

  const handlePrevious = () => {
    if (offset < totalCount - 1) {
      setOffset(offset + 1);
    }
  };

  const handleNext = () => {
    if (offset > 0) {
      setOffset(offset - 1);
    }
  };

  const getWeekDates = (date) => {
    const endDate = new Date(date);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    return { startDate, endDate };
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const copyFormattedContent = () => {
    if (!summary || !contentRef.current) return;

    const contentHTML = contentRef.current.innerHTML;

    const blob = new Blob([contentHTML], { type: "text/html" });
    const clipboardItem = new ClipboardItem({ "text/html": blob });

    navigator.clipboard.write([clipboardItem]).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "The formatted summary has been copied to clipboard.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Copy failed",
          description: "There was an error copying the summary.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    );
  };

  if (!summary) {
    return <Text>Loading...</Text>;
  }

  const { startDate, endDate } = getWeekDates(summary.created_at);
  const weekNumber = getWeekNumber(endDate);
  const weekRange = `Week ${weekNumber} - ${formatDate(
    startDate
  )} to ${formatDate(endDate)}`;

  return (
    <VStack spacing={4} align="stretch" mx={[2, 10, 10]}>
      <Heading as="h1" size="xl">
        AI Research Weekly Summary
      </Heading>
      <Text>
        This page provides a weekly summary of the top AI research papers. Each
        summary highlights key findings and breakthroughs in artificial
        intelligence in the last seven days! Things change rapidly in our field,
        so be sure to check here regularly.
      </Text>
      <hr />
      <Stack
        direction={["column", "column", "row"]}
        justifyContent="space-between"
        alignItems={["flex-start", "flex-start", "center"]}
        spacing={[4, 4, 0]}
      >
        <Heading as="h2" size="md">
          {weekRange}
        </Heading>
        <Stack
          direction={["column", "column", "row"]}
          spacing={2}
          width={["100%", "100%", "auto"]}
        >
          <Button
            onClick={handlePrevious}
            isDisabled={offset >= totalCount - 1}
            width={["100%", "100%", "auto"]}
          >
            Previous Week
          </Button>
          <Button
            onClick={handleNext}
            isDisabled={offset <= 0}
            width={["100%", "100%", "auto"]}
          >
            Next Week
          </Button>
          <Button
            leftIcon={<CopyIcon />}
            onClick={copyFormattedContent}
            colorScheme="blue"
            width={["100%", "100%", "auto"]}
          >
            Copy
          </Button>
        </Stack>
      </Stack>
      <Box ref={contentRef}>
        <ReactMarkdown components={ChakraUIRenderer(customTheme)}>
          {summary.weekly_summary}
        </ReactMarkdown>
      </Box>
    </VStack>
  );
};

// Helper function to get week number
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}

export default WeeklySummary;
