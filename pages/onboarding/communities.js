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
  Divider,
  Button,
  VStack,
  useToast,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  Progress,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import JoinLeaveButton from "@/components/Community/JoinLeaveButton";
import MetaTags from "@/components/MetaTags";

/**
 * Onboarding Communities Page (no clicking into community detail)
 */
export default function CommunitiesOnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, accessToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState([]);
  const [avatarMap, setAvatarMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // 1) Load from /api/community/list
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    loadCommunitiesData();
  }, [user]);

  async function loadCommunitiesData() {
    setLoading(true);
    try {
      const resp = await fetch(`/api/community/list?userId=${user.id}`);
      if (!resp.ok) {
        throw new Error("Failed to load communities");
      }
      const data = await resp.json();

      // data.myCommunities, data.otherCommunities, data.avatarMap
      // Merge them into one array, marking isMember accordingly
      const mine = (data.myCommunities || []).map((c) => ({
        ...c,
        isMember: true,
      }));
      const others = (data.otherCommunities || []).map((c) => ({
        ...c,
        isMember: false,
      }));
      let merged = [...mine, ...others];

      // Shuffle them if you want a random order:
      merged = merged.sort(() => Math.random() - 0.5);

      setCommunities(merged);
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

  // 2) Handle membership toggling
  async function handleToggleMembership(communityId, joined) {
    // Immediately update local state
    setCommunities((prev) =>
      prev.map((c) => (c.id === communityId ? { ...c, isMember: joined } : c))
    );

    // Then call /api/community/toggle-membership
    try {
      const resp = await fetch("/api/community/toggle-membership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // optional if you verify on server
        },
        body: JSON.stringify({
          userId: user?.id,
          communityId,
          join: joined,
        }),
      });

      if (!resp.ok) {
        throw new Error("Failed to toggle membership.");
      }
      // Could optionally re-fetch data or rely on local state
    } catch (err) {
      console.error("toggleMembership error:", err);
      toast({
        title: "Error",
        description: "Could not update community membership.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  // 3) Check if a community matches the current search term
  function matchesSearch(community, term) {
    if (!term) return true;
    const lower = term.toLowerCase();

    // Check name
    if (community.name?.toLowerCase().includes(lower)) {
      return true;
    }
    // Check description
    if (community.description?.toLowerCase().includes(lower)) {
      return true;
    }
    // Check tasks
    if (community.community_tasks?.length > 0) {
      for (const ct of community.community_tasks) {
        const taskName = ct.tasks?.task?.toLowerCase() || "";
        if (taskName.includes(lower)) {
          return true;
        }
      }
    }

    return false;
  }

  // 4) Filter the displayed communities
  const filteredCommunities = communities.filter((c) =>
    matchesSearch(c, searchTerm)
  );

  // 5) The "Next" button to continue onboarding
  const handleContinue = async () => {
    if (!user?.id) return;
    try {
      // Example: hitting a route to mark this onboarding step complete
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
  };

  // 6) A helper card for each community
  function CommunityCard({ community }) {
    const { id, name, description, community_tasks, isMember } = community;
    const previewArr = avatarMap[id] || [];
    const shown = previewArr.slice(0, 3);
    const leftover = Math.max(0, previewArr.length - 3);

    // Notice: We do NOT link or make anything clickable.
    // The card just displays info and the join/leave button.
    return (
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="md"
        bg="white"
        boxShadow="sm"
        /* No cursor:pointer or onClick here */
      >
        <Heading as="h3" size="md" mb={1}>
          {name}
        </Heading>
        <Text fontSize="xs" color="gray.500" mb={1}>
          Created by Mike Young
        </Text>

        <Text fontSize="sm" color="gray.700" mb={2}>
          {description || "No description provided."}
        </Text>

        {community_tasks?.length > 0 ? (
          <Wrap mb={4}>
            {community_tasks.map((ct) => (
              <WrapItem key={ct.task_id}>
                <Tag variant="subtle" colorScheme="blue">
                  <TagLabel>{ct.tasks?.task || "Unknown Task"}</TagLabel>
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        ) : (
          <Text fontSize="sm" color="gray.500" mb={3}>
            (No tasks linked)
          </Text>
        )}

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
          <JoinLeaveButton
            communityId={id}
            userId={user.id}
            isMember={isMember}
            onToggle={(communityId, joined) =>
              handleToggleMembership(communityId, joined)
            }
          />
        )}
      </Box>
    );
  }

  // 7) Render
  return (
    <>
      <MetaTags
        title="Communities Setup"
        description="Choose your preferred communities"
        socialPreviewTitle="Communities Setup - AIModels.fyi"
        socialPreviewSubtitle="Join AI communities"
      />

      <Container maxW="4xl" py={8}>
        {/* Onboarding Header */}
        <Box mb={8}>
          <Flex justify="space-between" align="center" mb={4}>
            {/* BACK button */}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ChevronLeftIcon />}
              onClick={() => router.push("/onboarding/roles")}
            >
              Back
            </Button>

            {/* Step Info */}
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Step 2 of 4 - Communities
            </Text>

            {/* NEXT button (top right) */}
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
            value={50} // or 66, depending on your steps
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

          {/* Search Box */}
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

          {/* Single grid of all communities */}
          {loading ? (
            <Box textAlign="center" py={6}>
              <Spinner size="lg" />
            </Box>
          ) : filteredCommunities.length === 0 ? (
            <Text fontSize="sm" mt={4} color="gray.600">
              No communities found.
            </Text>
          ) : (
            <SimpleGrid columns={[1, 1, 2, 3]} spacing={4}>
              {filteredCommunities.map((comm) => (
                <CommunityCard key={comm.id} community={comm} />
              ))}
            </SimpleGrid>
          )}
        </VStack>

        <Box textAlign="center" pt={8}>
          <Button colorScheme="blue" size="lg" px={8} onClick={handleContinue}>
            Continue
          </Button>
        </Box>
      </Container>
    </>
  );
}
