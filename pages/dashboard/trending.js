import React from "react";
import { Box } from "@chakra-ui/react";
import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import TrendingTopics from "@/components/TrendingTopics";
import MetaTags from "@/components/MetaTags";

const TrendingPage = () => {
  return (
    <>
      <MetaTags
        title="Trending"
        description="Discover trending AI research topics, papers, and models"
        socialPreviewTitle="Trending - AIModels.fyi"
        socialPreviewSubtitle="See what's popular in AI research"
      />

      <DashboardLayout>
        <Box>
          <TrendingTopics />
        </Box>
      </DashboardLayout>
    </>
  );
};

export default TrendingPage;
