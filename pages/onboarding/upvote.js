// /pages/onboarding/upvote.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Heading,
  Text,
  VStack,
  Flex,
  Spinner,
  Button,
  Box,
  SimpleGrid,
  Progress,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import MetaTags from "@/components/MetaTags";
import OnboardingPaperCard from "@/components/Onboarding/OnboardingPaperCard";

export default function UpvoteOnboardingPage() {
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    async function fetchRandomPapers() {
      setLoading(true);
      try {
        const res = await fetch("/api/onboarding/recent-random?limit=3");
        if (!res.ok) throw new Error("Failed to fetch random papers");
        const data = await res.json();
        setPapers(data.papers || []);
      } catch (err) {
        console.error("Error fetching random papers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRandomPapers();
  }, []);

  async function handleContinue() {
    if (!user?.id) {
      router.push("/onboarding/communities");
      return;
    }

    try {
      const resp = await fetch("/api/onboarding/complete-upvote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!resp.ok) throw new Error("Failed to update upvote onboarding.");
      router.push("/onboarding/communities");
    } catch (err) {
      console.error("Error completing upvote step:", err);
    }
  }

  async function handleSkip() {
    if (!user?.id) {
      router.push("/onboarding/communities");
      return;
    }

    try {
      const resp = await fetch("/api/onboarding/complete-upvote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!resp.ok) throw new Error("Failed to update upvote onboarding.");
      router.push("/onboarding/communities");
    } catch (err) {
      console.error("Error completing upvote step:", err);
    }
  }

  // Callback for when a vote occurs
  const handleVote = (voted) => {
    if (voted) {
      setHasVoted(true);
    }
  };

  return (
    <>
      <MetaTags
        title="Help Shape the Future of AI Research"
        description="Upvote your favorite AI papers"
      />
      <Container maxW="6xl" py={10}>
        <Box mb={8} width="full">
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="sm" color="gray.600">
              Step 1 of 4 - Upvote
            </Text>
            <Box w={16} />
          </Flex>
          <Progress
            value={25}
            size="sm"
            colorScheme="blue"
            borderRadius="full"
          />
        </Box>

        <VStack align="center" spacing={6}>
          <Box textAlign="center" maxW="4xl" mb={8}>
            <Heading size="lg">Cast your first vote</Heading>
            <Text mt={4}>
              We use collective intelligence to surface AI research that
              matters. Which of these papers do you think is most impactful?
              <b> Click the green upvote button </b> to cast your first vote.
            </Text>
          </Box>

          {loading && (
            <Flex justify="center" w="full" mt={6}>
              <Spinner size="lg" />
            </Flex>
          )}

          {!loading && papers.length > 0 && (
            <SimpleGrid
              columns={{ base: 1, md: 3 }}
              spacing={5}
              w="full"
              mt={4}
            >
              {papers.map((paper) => (
                <OnboardingPaperCard
                  key={paper.id}
                  paper={paper}
                  onVote={handleVote}
                  hasAnyVotes={hasVoted}
                />
              ))}
            </SimpleGrid>
          )}

          {!loading && papers.length === 0 && (
            <Text fontSize="sm" color="gray.600">
              No recent papers found.
            </Text>
          )}

          <VStack align="center" spacing={3} w="full" pt={6}>
            {hasVoted ? (
              <Button colorScheme="blue" size="lg" onClick={handleContinue}>
                Continue
              </Button>
            ) : (
              <Button variant="link" onClick={handleSkip}>
                Skip for now
              </Button>
            )}
          </VStack>
        </VStack>
      </Container>
    </>
  );
}
