import React from "react";
import { Box, Container } from "@chakra-ui/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WeeklySummary from "@/components/WeeklySummary";

const WeeklyPaperSummaryPage = () => {
  return (
    <DashboardLayout>
      <Container maxW="container.xl" py={8}>
        <Box>
          <WeeklySummary />
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default WeeklyPaperSummaryPage;
