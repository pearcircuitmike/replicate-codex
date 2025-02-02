import React from "react";
import { Box, Container } from "@chakra-ui/react";
import DashboardLayout from "../../components/Dashboard/Layout/DashboardLayout";
import MetaTags from "../../components/MetaTags";
import RAGchat from "../../components/RAGChat";

export default function AssistantPage() {
  return (
    <>
      <MetaTags
        title="Assistant - AImodels.fyi"
        description="Describe what you are working on and get models and papers that can help."
      />
      <DashboardLayout>
        <Container maxW="8xl">
          <Box>
            {/* Always render RAGchat so free users can use up to 5 chats */}
            <RAGchat />
          </Box>
        </Container>
      </DashboardLayout>
    </>
  );
}
