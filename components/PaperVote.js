import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
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
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const checkVoteStatus = useCallback(async () => {
    try {
      const headers = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      const response = await fetch(`/api/get-vote-status?paperId=${paperId}`, {
        headers,
      });
      if (!response.ok) throw new Error("Failed to check vote status");
      const data = await response.json();
      if (user) {
        setVote(data.userVote || 0);
      }
      setScore(data.totalScore || 0);
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
  }, [user, accessToken, paperId, toast]);

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
    if (isLoading) return;

    setIsLoading(true);
    const oldVote = vote;
    const oldScore = score;
    const finalVote = oldVote === newVote ? 0 : newVote;

    setVote(finalVote);
    setScore(score + finalVote - oldVote);

    try {
      const response = await fetch("/api/record-vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          paperId,
          vote: finalVote,
        }),
      });

      if (!response.ok) throw new Error("Vote failed");
      await checkVoteStatus();
    } catch (error) {
      console.error("Error voting:", error);
      setVote(oldVote);
      setScore(oldScore);
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

  const buttonSizes = {
    sm: "xs",
    md: "sm",
    lg: "md",
  };

  const scoreSizes = {
    sm: "xs",
    md: "sm",
    lg: "md",
  };

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
        />
        <Text fontSize={scoreSizes[size]} fontWeight="medium">
          {score}
        </Text>
      </HStack>
    );
  }

  return (
    <Container spacing={1} align="center" {...containerProps}>
      <Button
        onClick={() => handleVote(1)}
        isLoading={isLoading}
        variant="ghost"
        size={buttonSizes[size]}
        w={variant === "horizontal" ? "auto" : "full"}
        aria-label="Upvote"
      >
        <Icon
          as={TriangleUpIcon}
          color={vote === 1 ? "orange.500" : "gray.500"}
        />
      </Button>
      <Text fontSize={scoreSizes[size]} fontWeight="medium">
        {score}
      </Text>
      <Button
        onClick={() => handleVote(-1)}
        isLoading={isLoading}
        variant="ghost"
        size={buttonSizes[size]}
        w={variant === "horizontal" ? "auto" : "full"}
        aria-label="Downvote"
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
