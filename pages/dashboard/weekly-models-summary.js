import React from "react";
import { Box, Container } from "@chakra-ui/react";
import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import WeeklyModelSummary from "@/components/WeeklyModelSummary";

const WeeklyModelSummaryPage = () => {
  return (
    <DashboardLayout>
      <Container maxW="container.xl" py={8}>
        <Box>
          <WeeklyModelSummary />
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default WeeklyModelSummaryPage;
