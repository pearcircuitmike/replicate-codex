import React from "react";
import { Box, Heading, HStack } from "@chakra-ui/react";
import ResourceCard from "@/components/ResourceCard";
import { formatLargeNumber } from "@/pages/api/utils/formatLargeNumber";

// Function to clean up the generatedSummary and truncate it to 3 lines
const cleanAndTruncateSummary = (summary, type) => {
  if (!summary) return "No description provided";

  // Remove specific headers and hyphens based on the type
  if (type === "model") {
    summary = summary.replace("## Model overview", "").trim();
    summary = summary.replace("## Model Overview", "").trim();
  } else if (type === "paper") {
    summary = summary.replace("## Overview", "").replace(/-/g, "").trim();
  }

  // Truncate to the first 3 lines
  const maxLines = 3;
  const lines = summary.split("\n").filter(Boolean); // Split by lines and remove empty lines

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines).join(" ") + "...";
  }

  return lines.join(" ");
};

const LandingPageTrending = ({ trendingModels, trendingPapers, isLoading }) => {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""; // Dynamically set the base URL

  const renderSection = (title, items, renderItem) => (
    <Box mb={8}>
      <Heading as="h2" size="md" mb={4}>
        {title}
      </Heading>
      <HStack
        spacing={4}
        overflowX="auto"
        pb={2}
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        }}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <React.Fragment key={index}>
                <ResourceCard isLoading />
              </React.Fragment>
            ))
          : items.map(renderItem)}
      </HStack>
    </Box>
  );

  const renderPaper = (paper) => {
    const blurb = cleanAndTruncateSummary(paper.generatedSummary, "paper");

    return (
      <ResourceCard
        key={paper.id}
        href={`/papers/${encodeURIComponent(
          paper.platform
        )}/${encodeURIComponent(paper.slug)}`}
        title={paper.title}
        score={Math.floor(paper.totalScore)}
        scoreLabel="Total Score"
        imageSrc={paper.thumbnail}
        placeholderTitle="Paper"
        blurb={blurb}
        owners={[]} // No authors passed here
      />
    );
  };

  const renderModel = (model) => {
    const creator = [
      {
        name: model.creator,
        link: `${baseUrl}/creators/${encodeURIComponent(
          model.platform
        )}/${encodeURIComponent(model.creator)}`,
      },
    ];

    const blurb = cleanAndTruncateSummary(model.generatedSummary, "model");

    return (
      <ResourceCard
        key={model.id}
        href={`/models/${model.platform}/${encodeURIComponent(model.slug)}`}
        title={model.modelName}
        score={formatLargeNumber(Math.floor(model.totalScore))}
        scoreLabel="Total Score"
        imageSrc={model.example}
        placeholderTitle="Model"
        blurb={blurb}
        owners={creator}
      />
    );
  };

  return (
    <Box px={"5vw"} color="gray.700">
      {renderSection("Breakout papers", trendingPapers, renderPaper)}
      {renderSection("Trending models", trendingModels, renderModel)}
    </Box>
  );
};

export default LandingPageTrending;
