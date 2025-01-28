import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Icon,
  useToast,
  VStack,
  Text,
  HStack,
  useMediaQuery,
} from "@chakra-ui/react";
import { TriangleUpIcon, TriangleDownIcon } from "@chakra-ui/icons";
import { useAuth } from "@/context/AuthContext";

const PaperVote = ({
  paperId,
  variant = "vertical", // 'vertical' | 'horizontal' | 'compact'
  size = "md", // 'sm' | 'md' | 'lg'
  containerProps = {},
}) => {
  const [vote, setVote] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const checkVoteStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/get-vote-status?paperId=${paperId}`, {
        headers,
      });
      if (!response.ok) {
        throw new Error("Failed to check vote status");
      }

      const data = await response.json();
      if (user) {
        setVote(data.userVote || 0);
      }
      // If data.totalScore is a string, parse it, otherwise just use 0 as fallback
      setTotalScore(parseFloat(data.totalScore) || 0);
    } catch (error) {
      console.error("Error checking vote status:", error);
      toast({
        title: "Error checking vote status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [paperId, user, accessToken, toast]);

  useEffect(() => {
    checkVoteStatus();
  }, [checkVoteStatus]);

  const handleVote = async (newVote) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to vote",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isLoading) return; // Prevent double-click if desired

    setIsLoading(true);

    const oldVote = vote;
    const finalVote = oldVote === newVote ? 0 : newVote;
    setVote(finalVote);

    try {
      const response = await fetch("/api/record-vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ paperId, vote: finalVote }),
      });

      if (!response.ok) {
        throw new Error("Vote failed");
      }

      // Re-fetch the new total score
      await checkVoteStatus();
    } catch (error) {
      console.error("Error recording vote:", error);
      setVote(oldVote);
      toast({
        title: "Error recording vote",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Button sizing
  const buttonSizes = { sm: "xs", md: "sm", lg: "md" };
  // Text sizing
  const scoreSizes = { sm: "xs", md: "sm", lg: "md" };

  // Container can be row or column
  const Container = variant === "horizontal" ? HStack : VStack;

  if (variant === "compact") {
    return (
      <HStack spacing={1} align="center" {...containerProps}>
        <Icon
          as={TriangleUpIcon}
          color={vote === 1 ? "orange.500" : "gray.500"}
          cursor="pointer"
          onClick={() => handleVote(1)}
          boxSize={size === "sm" ? 3 : size === "md" ? 4 : 5}
          opacity={isLoading ? 0.6 : 1}
        />
        {/* Rounded score here */}
        <Text fontSize={scoreSizes[size]} fontWeight="medium">
          {Math.round(totalScore)}
        </Text>
      </HStack>
    );
  }

  return (
    <Container spacing={1} align="center" {...containerProps}>
      <Button
        onClick={() => handleVote(1)}
        variant="ghost"
        size={buttonSizes[size]}
        w={variant === "horizontal" ? "auto" : "full"}
        aria-label="Upvote"
        isDisabled={isLoading}
        opacity={isLoading ? 0.6 : 1}
      >
        <Icon
          as={TriangleUpIcon}
          color={vote === 1 ? "orange.500" : "gray.500"}
        />
      </Button>

      {/* Use Math.round() so it’s a whole number */}
      <Text fontSize={scoreSizes[size]} fontWeight="medium">
        {Math.round(totalScore)}
      </Text>

      <Button
        onClick={() => handleVote(-1)}
        variant="ghost"
        size={buttonSizes[size]}
        w={variant === "horizontal" ? "auto" : "full"}
        aria-label="Downvote"
        isDisabled={isLoading}
        opacity={isLoading ? 0.6 : 1}
      >
        <Icon
          as={TriangleDownIcon}
          color={vote === -1 ? "blue.500" : "gray.500"}
        />
      </Button>
    </Container>
  );
};

export default PaperVote;
