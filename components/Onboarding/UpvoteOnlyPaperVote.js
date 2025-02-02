import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Text,
  HStack,
  keyframes,
  useToken,
  useToast,
} from "@chakra-ui/react";
import { TriangleUpIcon } from "@chakra-ui/icons";
import { useAuth } from "@/context/AuthContext";

/* --- Confetti Animations --- */
const topBubbles = keyframes`
  0% {
    background-position: 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%;
    opacity: 1;
    background-size: 8% 8%;
  }
  100% {
    background-position: 20% 0%, 30% -10%, 40% -20%, 50% -30%, 60% -20%, 70% -10%, 80% 0%, 90% -10%, 100% -20%;
    opacity: 0;
    background-size: 12% 12%;
  }
`;

const bottomBubbles = keyframes`
  0% {
    background-position: 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%;
    opacity: 1;
    background-size: 8% 8%;
  }
  100% {
    background-position: 20% 100%, 30% 110%, 40% 120%, 50% 130%, 60% 120%, 70% 110%, 80% 100%;
    opacity: 0;
    background-size: 12% 12%;
  }
`;

const pulseKeyframe = keyframes`
  0% {
    transform: scale(.9);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 25px rgba(56, 161, 105, 0);
  }
  100% {
    transform: scale(.9);
    box-shadow: 0 0 0 0 rgba(56, 161, 105, 0);
  }
`;

const confettiColors = [
  "red.500",
  "orange.500",
  "yellow.500",
  "green.500",
  "teal.500",
  "blue.500",
  "cyan.500",
  "purple.500",
  "pink.500",
];

export default function UpvoteOnlyPaperVote({
  paperId,
  initialScore = 0,
  hasAnyVotes,
  onVote,
}) {
  const [voted, setVoted] = useState(false);
  const [score, setScore] = useState(initialScore);
  const [isAnimating, setIsAnimating] = useState(false);
  const pulseDelayRef = useRef(Math.random() * -1.5);

  const { user, accessToken } = useAuth();
  const toast = useToast();
  const colorTokens = useToken("colors", confettiColors);

  // Fetch the user's existing vote status + total score
  const checkVoteStatus = useCallback(async () => {
    try {
      const headers = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      const res = await fetch(`/api/get-vote-status?paperId=${paperId}`, {
        headers,
      });
      if (!res.ok) throw new Error("Failed to check vote status");

      const data = await res.json();

      if (user) {
        setVoted(data.userVote === 1);
      }
      setScore(parseFloat(data.totalScore) || 0);
    } catch (error) {
      console.error("Error checking vote status:", error);
      toast({
        title: "Error",
        description: "Could not fetch vote status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [paperId, accessToken, user, toast]);

  useEffect(() => {
    checkVoteStatus();
  }, [checkVoteStatus, paperId]);

  // Create random confetti background
  const generateConfettiGradients = (numGradients) => {
    return Array(numGradients)
      .fill(null)
      .map(() => {
        const color =
          colorTokens[Math.floor(Math.random() * colorTokens.length)];
        return `radial-gradient(circle, ${color} 20%, transparent 20%)`;
      })
      .join(", ");
  };

  // Vote or remove vote
  const handleVote = async () => {
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

    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 750);
    }

    const wasVoted = voted;
    const newVote = wasVoted ? 0 : 1;

    setVoted(!wasVoted);
    setScore((prevScore) => (wasVoted ? prevScore - 1 : prevScore + 1));

    try {
      const resp = await fetch("/api/record-vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ paperId, vote: newVote }),
      });
      if (!resp.ok) throw new Error("Vote failed");

      await checkVoteStatus();
      if (onVote) onVote(!wasVoted);
    } catch (error) {
      console.error("Error recording vote:", error);

      setVoted(wasVoted);
      setScore((prevScore) => (wasVoted ? prevScore + 1 : prevScore - 1));
      toast({
        title: "Error recording vote",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Round to the nearest integer (and optionally show K/M if large)
  const formatScore = (num) => {
    const rounded = Math.round(num);

    if (rounded >= 1_000_000) {
      return `${Math.round(rounded / 1_000_000)}M`;
    }
    if (rounded >= 1_000) {
      return `${Math.round(rounded / 1_000)}K`;
    }
    return rounded.toString();
  };

  return (
    <Box
      as="button"
      onClick={handleVote}
      px="6"
      py="3"
      borderRadius="md"
      bg={voted ? "white" : hasAnyVotes && !voted ? "white" : "green.500"}
      color={
        voted ? "orange.500" : hasAnyVotes && !voted ? "gray.600" : "white"
      }
      position="relative"
      transition="all 0.1s ease-in"
      transform={isAnimating ? "scale(0.9)" : "scale(1)"}
      boxShadow={
        voted || (hasAnyVotes && !voted)
          ? "0 2px 6px rgba(160, 160, 160, 0.15)"
          : "0 2px 25px rgba(56, 161, 105, 0.5)"
      }
      isolation="isolate"
      zIndex={2}
      overflow="visible"
      _hover={{ opacity: 0.9 }}
      _active={{
        transform: "scale(0.9)",
        boxShadow: "0 2px 10px rgba(160, 160, 160, 0.3)",
      }}
      sx={{
        "&::before, &::after": {
          position: "absolute",
          content: '""',
          display: isAnimating ? "block" : "none",
          width: "300%",
          height: "300%",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: -1,
          transition: "all ease-in-out 0.5s",
          backgroundRepeat: "no-repeat",
          pointerEvents: "none",
        },
        "&::before": {
          backgroundImage: generateConfettiGradients(9),
          backgroundSize: "8% 8%",
          animation: isAnimating
            ? `${topBubbles} 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
            : "none",
        },
        "&::after": {
          backgroundImage: generateConfettiGradients(7),
          backgroundSize: "8% 8%",
          animation: isAnimating
            ? `${bottomBubbles} 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
            : "none",
        },
        "&:not([data-voted='true'])": hasAnyVotes
          ? {}
          : {
              animation: `${pulseKeyframe} 1.5s infinite`,
              animationDelay: `${pulseDelayRef.current}s`,
            },
      }}
      data-voted={voted}
    >
      <HStack spacing={2}>
        <TriangleUpIcon boxSize="5" transition="transform 0.2s" />
        <Text fontWeight="medium">{formatScore(score)}</Text>
      </HStack>
    </Box>
  );
}
