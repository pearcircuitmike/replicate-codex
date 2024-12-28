import React from "react";
import { Box, Container } from "@chakra-ui/react";
import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import WeeklyModelSummary from "@/components/WeeklyModelSummary";
import MetaTags from "@/components/MetaTags";

const WeeklyModelSummaryPage = () => {
  return (
    <>
      <MetaTags
        title="Weekly Models Summary"
        description="View your weekly summary of AI models and updates"
        socialPreviewTitle="Weekly Models Summary - AIModels.fyi"
        socialPreviewSubtitle="Stay up to date with the latest AI model releases"
      />

      <DashboardLayout>
        <Container maxW="container.xl" py={8}>
          <Box>
            <WeeklyModelSummary />
          </Box>
        </Container>
      </DashboardLayout>
    </>
  );
};

export default WeeklyModelSummaryPage;
