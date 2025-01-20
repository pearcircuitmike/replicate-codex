import React from "react";
import { Box, Container } from "@chakra-ui/react";
import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import WeeklySummary from "@/components/WeeklyPaperSummary";
import MetaTags from "@/components/MetaTags";

const WeeklyPaperSummaryPage = () => {
  return (
    <>
      <MetaTags
        title="Weekly Papers Summary"
        description="View your weekly summary of AI research papers and updates"
        socialPreviewTitle="Weekly Papers Summary - AIModels.fyi"
        socialPreviewSubtitle="Stay up to date with the latest AI research papers"
      />

      <DashboardLayout>
        <Container maxW="container.xl" py={8}>
          <Box>
            <WeeklySummary />
          </Box>
        </Container>
      </DashboardLayout>
    </>
  );
};

export default WeeklyPaperSummaryPage;
