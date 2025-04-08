// /pages/onboarding/communities.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Avatar,
  Spinner,
  Button,
  VStack,
  useToast,
  Tag,
  Progress,
  Input,
  InputGroup,
  InputLeftElement,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { ChevronRightIcon, SearchIcon, StarIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import MetaTags from "@/components/MetaTags";

export default function CommunitiesOnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, accessToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState([]);
  const [avatarMap, setAvatarMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [joinedCount, setJoinedCount] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Load communities once on mount
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    loadCommunitiesData();
  }, [user]);

  // Track joined count
  useEffect(() => {
    const count = communities.filter((c) => c.isMember).length;
    setJoinedCount(count);
  }, [communities]);

  async function loadCommunitiesData() {
    setLoading(true);
    try {
      const resp = await fetch(`/api/community/list?userId=${user.id}`);
      if (!resp.ok) {
        throw new Error("Failed to load communities");
      }
      const data = await resp.json();

      // Get currently joined communities
      const mine = (data.myCommunities || []).map((c) => ({
        ...c,
        isMember: true,
      }));

      // Get other communities
      const others = (data.otherCommunities || []).map((c) => ({
        ...c,
        isMember: false,
      }));

      // Process and add member counts
      const allCommunities = [...mine, ...others].map((comm) => {
        const members = (data.avatarMap[comm.id] || []).length;
        return {
          ...comm,
          memberCount: members,
          isPopular: members > 5, // Lower threshold to make sure we have some popular communities
        };
      });

      // Auto-select communities if none are joined (only if myCommunities is null or empty)
      let joinedCommunities = [...allCommunities];

      if (
        mine.length === 0 &&
        (!data.myCommunities || data.myCommunities.length === 0)
      ) {
        // ALWAYS select the top 2 communities by member count, regardless of popularity
        const topCommunities = allCommunities
          .filter((c) => !c.isMember)
          .sort((a, b) => b.memberCount - a.memberCount)
          .slice(0, 2);

        // Mark them as joined directly in the UI
        joinedCommunities = allCommunities.map((comm) => {
          const shouldAutoJoin = topCommunities.some((p) => p.id === comm.id);
          if (shouldAutoJoin) {
            return {
              ...comm,
              isMember: true,
              isRecommended: true,
            };
          }
          return comm;
        });

        // Also update them on the server
        topCommunities.forEach((comm) => {
          fetch("/api/community/toggle-membership", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              userId: user.id,
              communityId: comm.id,
              join: true,
            }),
          }).catch((err) => {
            console.error("Auto-join error:", err);
          });
        });
      }

      setCommunities(joinedCommunities);
      setAvatarMap(data.avatarMap || {});
    } catch (err) {
      console.error("loadCommunitiesData error:", err);
      toast({
        title: "Error",
        description: "Failed to load communities.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleMembership(communityId, joined) {
    // Update UI immediately for responsiveness
    setCommunities((prev) =>
      prev.map((c) => (c.id === communityId ? { ...c, isMember: joined } : c))
    );

    try {
      const resp = await fetch("/api/community/toggle-membership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          communityId,
          join: joined,
        }),
      });

      if (!resp.ok) {
        throw new Error("Failed to toggle membership");
      }
    } catch (err) {
      console.error("toggleMembership error:", err);
      toast({
        title: "Error",
        description: "Could not update community membership.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

      // Revert UI on error
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === communityId ? { ...c, isMember: !joined } : c
        )
      );
    }
  }

  function matchesSearch(community, term) {
    if (!term) return true;
    const lower = term.toLowerCase();
    if (community.name?.toLowerCase().includes(lower)) return true;
    if (community.description?.toLowerCase().includes(lower)) return true;
    return false;
  }

  const filteredCommunities = communities.filter((c) =>
    matchesSearch(c, searchTerm)
  );

  // Limit visible communities on mobile
  const visibleCommunities = showAll
    ? filteredCommunities
    : filteredCommunities.slice(0, 4);

  async function handleContinue() {
    if (!user?.id) return;

    // Check if user has joined any communities
    const hasJoined = communities.some((c) => c.isMember);

    if (!hasJoined) {
      // Show confirmation dialog
      setShowConfirmation(true);
      return;
    }

    try {
      const response = await fetch("/api/onboarding/complete-communities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to update communities onboarding");
      }

      router.push("/onboarding/frequency");
    } catch (error) {
      console.error("Error finalizing communities onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  function CommunityCard({ community }) {
    const {
      id,
      name,
      description,
      isMember,
      isPopular,
      memberCount,
      isRecommended,
    } = community;

    const previewArr = avatarMap[id] || [];
    const shown = previewArr.slice(0, 3);
    const leftover = Math.max(0, previewArr.length - 3);

    return (
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="md"
        bg={isPopular ? "blue.50" : "white"}
        boxShadow={isPopular ? "md" : "sm"}
        position="relative"
      >
        {/* Popular badge */}
        {isPopular && (
          <Tag
            position="absolute"
            top={2}
            right={2}
            colorScheme="blue"
            size="sm"
          >
            <StarIcon mr={1} boxSize={3} />
            Popular in AI
          </Tag>
        )}

        {/* Recommended badge */}
        {isRecommended && (
          <Tag
            position="absolute"
            top={isPopular ? 8 : 2}
            right={2}
            colorScheme="green"
            size="sm"
          >
            Recommended
          </Tag>
        )}

        <Heading as="h3" size="md" mb={1}>
          {name}
        </Heading>
        <Text fontSize="xs" color="gray.500" mb={1}>
          Created by Mike Young
        </Text>

        <Text fontSize="sm" color="gray.700" mb={2} noOfLines={2}>
          {description || "No description provided."}
        </Text>

        {/* Member count */}
        <Tag colorScheme="purple" size="sm" mb={2}>
          {memberCount}+ members
        </Tag>

        {/* Task tags removed as requested */}

        <Flex align="center" mb={3}>
          {shown.map((m) => (
            <Avatar
              key={m.user_id}
              src={m.avatar_url}
              name={m.full_name || "User"}
              size="sm"
              mr={-2}
            />
          ))}
          {leftover > 0 && (
            <Text fontSize="sm" color="gray.500" ml={2}>
              +{leftover} more
            </Text>
          )}
        </Flex>

        {user && (
          <Button
            size="sm"
            colorScheme={isMember ? "gray" : "blue"}
            onClick={() => handleToggleMembership(id, !isMember)}
          >
            {isMember ? "Leave" : "Join"}
          </Button>
        )}
      </Box>
    );
  }

  function ConfirmationDialog() {
    return (
      <AlertDialog
        isOpen={showConfirmation}
        leastDestructiveRef={undefined}
        onClose={() => setShowConfirmation(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              No Communities Selected
            </AlertDialogHeader>

            <AlertDialogBody>
              Joining communities helps you connect with like-minded people and
              discover relevant AI content. Are you sure you want to continue
              without joining any?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={() => setShowConfirmation(false)}>
                Go Back
              </Button>
              <Button
                colorScheme="blue"
                onClick={() => {
                  setShowConfirmation(false);
                  router.push("/onboarding/frequency");
                }}
                ml={3}
              >
                Continue Anyway
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    );
  }

  return (
    <>
      <MetaTags
        title="Communities Setup"
        description="Choose your preferred communities"
        socialPreviewTitle="Communities Setup - AIModels.fyi"
        socialPreviewSubtitle="Join AI communities"
      />
      <Container maxW="4xl" py={8}>
        <Box mb={8}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box />
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Step 2 of 3 - Communities
            </Text>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRightIcon />}
              onClick={handleContinue}
            >
              Next
            </Button>
          </Flex>

          <Progress
            value={67}
            size="sm"
            colorScheme="blue"
            borderRadius="full"
          />
        </Box>

        <VStack spacing={6} align="stretch">
          <Heading size="lg" textAlign="center">
            Pick your communities
          </Heading>
          <Text textAlign="center" color="gray.600" fontSize="lg">
            Join any groups that interest you
          </Text>

          <InputGroup my={4}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {loading ? (
            <Box textAlign="center" py={6}>
              <Spinner size="lg" />
            </Box>
          ) : filteredCommunities.length === 0 ? (
            <Text fontSize="sm" mt={4} color="gray.600">
              No communities found.
            </Text>
          ) : (
            <>
              <SimpleGrid columns={[1, 1, 2, 3]} spacing={4}>
                {visibleCommunities.map((comm) => (
                  <CommunityCard key={comm.id} community={comm} />
                ))}
              </SimpleGrid>

              {/* Show more button for mobile */}
              {!showAll && filteredCommunities.length > 4 && (
                <Button
                  mt={4}
                  variant="outline"
                  onClick={() => setShowAll(true)}
                  size="sm"
                >
                  Show all {filteredCommunities.length} communities
                </Button>
              )}
            </>
          )}
        </VStack>

        {/* Desktop Continue Button */}
        <Box textAlign="center" pt={8} display={["none", "none", "block"]}>
          <Button colorScheme="blue" size="lg" px={8} onClick={handleContinue}>
            Continue{" "}
            {joinedCount > 0
              ? `with ${joinedCount} ${
                  joinedCount === 1 ? "community" : "communities"
                }`
              : ""}
          </Button>
        </Box>
      </Container>

      {/* Mobile Floating Continue Button */}
      <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        py={4}
        px={6}
        bg="white"
        borderTopWidth="1px"
        borderTopColor="gray.200"
        textAlign="center"
        zIndex={10}
        display={["block", "block", "none"]}
        boxShadow="0 -2px 10px rgba(0,0,0,0.05)"
      >
        <Button
          colorScheme="blue"
          size="lg"
          width="100%"
          onClick={handleContinue}
        >
          Continue{" "}
          {joinedCount > 0
            ? `with ${joinedCount} ${
                joinedCount === 1 ? "community" : "communities"
              }`
            : ""}
        </Button>
      </Box>

      {/* Confirmation dialog */}
      <ConfirmationDialog />
    </>
  );
}
