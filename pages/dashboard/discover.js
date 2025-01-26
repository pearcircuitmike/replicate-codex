// pages/dashboard/discover.js
import React from "react";
import { Box, Container, Heading, Text, Button } from "@chakra-ui/react";
import DashboardLayout from "../../components/Dashboard/Layout/DashboardLayout";
import MetaTags from "../../components/MetaTags";
import RAGchat from "../../components/RAGChat";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

export default function DiscoverPage() {
  const { hasActiveSubscription } = useAuth();
  const router = useRouter();

  return (
    <>
      <MetaTags
        title="Discover - RAG Chat"
        description="Pinned in the main area, never over the sidebar."
      />
      <DashboardLayout>
        <Container maxW="container.xl" py={8}>
          <Box>
            {hasActiveSubscription ? (
              <RAGchat />
            ) : (
              <Box
                border="1px solid #ccc"
                p={4}
                borderRadius="md"
                textAlign="center"
              >
                <Heading as="h3" size="md" mb={4}>
                  Discover models that can solve your problem
                </Heading>
                <Text mb={4}>
                  Subscribe to chat with the largest collection of AI models on
                  the planet and find the one that works for you.
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
}
