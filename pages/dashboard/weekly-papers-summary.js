// pages/dashboard/weekly-paper-summary.js

import React from "react";
import { Box, Container, Button, Center, Text } from "@chakra-ui/react";
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
          {hasActiveSubscription ? (
            <WeeklySummary />
          ) : (
            <>
              {/* Content preview with smooth gradient overlay */}
              <Box
                position="relative"
                height="450px"
                overflow="hidden"
                pointerEvents="none"
              >
                <WeeklySummary />

                {/* Single smooth gradient overlay with progressive blur */}
                <Box
                  position="absolute"
                  inset="0"
                  bgGradient="linear(to-b, rgba(255,255,255,0) 50%, rgba(255,255,255,0.85) 90%)"
                  pointerEvents="none"
                  sx={{
                    maskImage:
                      "linear-gradient(to bottom, transparent 50%, black 90%)",
                    backdropFilter: "blur(0px)",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      backdropFilter: "blur(8px)",
                      opacity: 0,
                      background: "transparent",
                      maskImage:
                        "linear-gradient(to bottom, transparent 60%, black 100%)",
                    },
                  }}
                />
              </Box>

              <Center mt={6}>
                <Button
                  colorScheme="blue"
                  pointerEvents="auto"
                  onClick={() => router.push("/pricing")}
                >
                  Upgrade to Premium
                </Button>
              </Center>

              <Text mt={4} fontSize="sm" color="gray.600" textAlign="center">
                Unlock full access to read the entire summary and get all
                details.
              </Text>
            </>
          )}
        </Container>
      </DashboardLayout>
    </>
  );
};

export default WeeklyPaperSummaryPage;
