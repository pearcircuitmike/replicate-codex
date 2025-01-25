// pages/dashboard/weekly-paper-summary.js
import React from "react";
import { Box, Container, Heading, Text, Button } from "@chakra-ui/react";
import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import WeeklySummary from "@/components/WeeklyPaperSummary";
import MetaTags from "@/components/MetaTags";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

const WeeklyPaperSummaryPage = () => {
  const { hasActiveSubscription } = useAuth();
  const router = useRouter();

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
            {/* If user has an active subscription, render the full WeeklySummary component */}
            {hasActiveSubscription ? (
              <WeeklySummary />
            ) : (
              /* Otherwise, show a preview and an Upgrade button */
              <Box
                border="1px solid #ccc"
                p={4}
                borderRadius="md"
                textAlign="center"
              >
                <Heading as="h3" size="md" mb={4}>
                  Weekly Papers Summary (Limited Preview)
                </Heading>
                <Text mb={4}>
                  Subscribe to unlock the full weekly papers summary.
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

export default WeeklyPaperSummaryPage;
