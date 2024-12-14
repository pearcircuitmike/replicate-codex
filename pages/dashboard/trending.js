// /pages/dashboard/trending.js
import React from "react";
import { Box } from "@chakra-ui/react";
import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import TrendingTopics from "@/components/TrendingTopics";

const TrendingPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <TrendingTopics />
      </Box>
    </DashboardLayout>
  );
};

export default TrendingPage;
