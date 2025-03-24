import React from "react";
import { Box } from "@chakra-ui/react";
import DashboardLayout from "../../components/Dashboard/Layout/DashboardLayout";
import MetaTags from "../../components/MetaTags";
import RagChat from "../../components/RagChat";

export default function AssistantPage() {
  return (
    <>
      <MetaTags
        title="Assistant - AImodels.fyi"
        description="Describe what you are working on and get models and papers that can help."
      />
      <DashboardLayout>
        <Box height="calc(100vh - 128px)" overflow="hidden">
          {/* Adjust the height value based on your navbar height */}
          <RagChat />
        </Box>
      </DashboardLayout>
    </>
  );
}
