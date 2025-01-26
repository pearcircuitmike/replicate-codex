// pages/dashboard/weekly-model-summary.js
import React from "react";
import { Box, Container, Heading, Text, Button } from "@chakra-ui/react";
import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import WeeklyModelSummary from "@/components/WeeklyModelSummary";
import MetaTags from "@/components/MetaTags";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

const WeeklyModelSummaryPage = () => {
  const { hasActiveSubscription } = useAuth();
  const router = useRouter();

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
            {/* If user has an active subscription, render the full WeeklyModelSummary component */}
            {hasActiveSubscription ? (
              <WeeklyModelSummary />
            ) : (
              /* Otherwise, show a preview and an Upgrade button */
              <Box
                border="1px solid #ccc"
                p={4}
                borderRadius="md"
                textAlign="center"
              >
                <Heading as="h3" size="md" mb={4}>
                  Weekly Models Summary
                </Heading>
                <Text mb={4}>
                  Subscribe to unlock full details about the latest AI model
                  updates.
                </Text>
                <Button
                  colorScheme="blue"
                  onClick={() => router.push("/pricing")}
                >
                  Upgrade to Premium
                </Button>
              </Box>
            )}
          </Box>
        </Container>
      </DashboardLayout>
    </>
  );
};

export default WeeklyModelSummaryPage;
