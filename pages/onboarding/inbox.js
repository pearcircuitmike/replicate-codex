import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import MetaTags from "@/components/MetaTags";

export default function InboxOnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, accessToken } = useAuth();

  async function markAsDone() {
    if (!user?.id) return;

    try {
      const resp = await fetch("/api/onboarding/complete-inbox", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!resp.ok) {
        throw new Error("Failed to update inbox onboarding.");
      }
      router.push("/onboarding/communities");
    } catch (error) {
      console.error("Error completing inbox onboarding:", error);
      toast({
        title: "Error",
        description: "Could not mark your inbox step as done.",
        status: "error",
      });
    }
  }

  function skipForNow() {
    router.push("/onboarding/communities");
  }

  return (
    <>
      <MetaTags
        title="Welcome to aimodels.fyi!"
        description="Never Miss an Update"
      />
      <Container maxW="6xl" py={10}>
        <VStack align="center" spacing={6}>
          <Box textAlign="center" maxW="4xl" mb={8}>
            <Heading size="lg">Stay in the loop</Heading>
            <Text mt={4}>
              Every day, thousands of AI papers and models are released. We scan
              through all of them to bring you the breakthroughs that matter
              most. Add our emails to your safe senders list to make sure you
              never miss the important updates.
            </Text>
            <Box
              bg="gray.100"
              borderRadius="md"
              p={4}
              textAlign="center"
              mb={8}
              maxW="xl"
              mx="auto"
            >
              [GIF placeholder showing email safelist process]
            </Box>
          </Box>

          <VStack align="center" spacing={3} w="full" pt={6}>
            <Button
              colorScheme="blue"
              size="lg"
              onClick={markAsDone}
              data-testid="primary-button"
            >
              ✓ Done, I&apos;m all set!
            </Button>
            <Button
              variant="link"
              onClick={skipForNow}
              data-testid="secondary-button"
            >
              Skip for now (but you'll miss out on key AI updates!)
            </Button>
          </VStack>
        </VStack>
      </Container>
    </>
  );
}
