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
import supabase from "@/pages/api/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import JoinLeaveButton from "@/components/Community/JoinLeaveButton";
import MetaTags from "@/components/MetaTags";

export default function CommunitiesOnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, accessToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState([]);
  const [avatarMap, setAvatarMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // ───────────────────────────────────────────────────────────
  // 1) Fetch & prepare community data on mount
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    loadCommunitiesData();
  }, [user]);

  const loadCommunitiesData = async () => {
    setLoading(true);
    try {
      // A) Fetch all communities (with tasks)
      const { data: allComms, error: commErr } = await supabase
        .from("communities")
        .select(
          `
          *,
          community_tasks (
            task_id,
            tasks (
              id,
              task
            )
          )
        `
        )
        .limit(2000);

      if (commErr) throw commErr;
      if (!allComms) {
        setCommunities([]);
        setAvatarMap({});
        setLoading(false);
        return;
      }

      // Shuffle them for random order
      const shuffled = [...allComms].sort(() => Math.random() - 0.5);

      // B) Fetch user membership
      const { data: memberships, error: memErr } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", user.id)
        .limit(2000);

      if (memErr) throw memErr;
      const userMemberSet = new Set(memberships.map((m) => m.community_id));

      // Build single array with isMember property
      const allWithMembership = shuffled.map((c) => ({
        ...c,
        isMember: userMemberSet.has(c.id),
      }));

      // C) For avatar previews, gather membership data
      const commIds = allWithMembership.map((c) => c.id);
      const { data: allRows, error: allRowsErr } = await supabase
        .from("community_members")
        .select("community_id, user_id")
        .in("community_id", commIds)
        .limit(5000);

      if (allRowsErr) throw allRowsErr;

      // Up to 5 user IDs per community
      const partialIdsMap = {};
      for (const row of allRows) {
        if (!partialIdsMap[row.community_id]) {
          partialIdsMap[row.community_id] = [];
        }
        if (partialIdsMap[row.community_id].length < 5) {
          partialIdsMap[row.community_id].push(row.user_id);
        }
      }

      // Unique user IDs
      const uniqueUserIds = new Set();
      Object.values(partialIdsMap).forEach((arr) =>
        arr.forEach((uid) => uniqueUserIds.add(uid))
      );

      // D) Fetch profile info for those user IDs
      const { data: profileRows, error: profErr } = await supabase
        .from("public_profile_info")
        .select("id, full_name, avatar_url, username")
        .in("id", [...uniqueUserIds])
        .limit(5000);

      if (profErr) throw profErr;

      const profileMap = {};
      (profileRows || []).forEach((p) => {
        profileMap[p.id] = {
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          username: p.username,
        };
      });

      // Build avatar map
      const newAvatarMap = {};
      for (const [cId, userIds] of Object.entries(partialIdsMap)) {
        newAvatarMap[cId] = userIds.map((uid) => ({
          user_id: uid,
          avatar_url: profileMap[uid]?.avatar_url || "",
          full_name: profileMap[uid]?.full_name || "Anonymous",
        }));
      }

      // Update state
      setCommunities(allWithMembership);
      setAvatarMap(newAvatarMap);
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
  };

  // ───────────────────────────────────────────────────────────
  // 2) Handle membership changes
  // ───────────────────────────────────────────────────────────
  const handleToggleMembership = async (communityId, joined) => {
    // Flip isMember property locally
    setCommunities((prev) =>
      prev.map((c) => (c.id === communityId ? { ...c, isMember: joined } : c))
    );

    // Call your join/leave endpoint
    const endpoint = joined ? "/api/community/join" : "/api/community/leave";
    const method = joined ? "POST" : "DELETE";

    try {
      await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ communityId }),
      });
    } catch (error) {
      console.error("Error toggling membership:", error);
      toast({
        title: "Error",
        description: "Could not update community membership.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // ───────────────────────────────────────────────────────────
  // 3) Community Card (same as your main page design)
  // ───────────────────────────────────────────────────────────
  function CommunityCard({ community }) {
    const { isMember } = community;
    const previewArr = avatarMap[community.id] || [];
    const shown = previewArr.slice(0, 3);
    const leftover = previewArr.length > 3 ? previewArr.length - 3 : 0;

    return (
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="md"
        bg="white"
        boxShadow="sm"
        cursor="pointer"
        _hover={{ bg: "gray.50" }}
      >
        <Heading as="h3" size="md" mb={1}>
          {community.name}
        </Heading>
        <Text fontSize="xs" color="gray.500" mb={1}>
          Created by {community.created_by || "Unknown"}
        </Text>

        <Text fontSize="sm" color="gray.700" mb={2}>
          {community.description || "No description provided."}
        </Text>

        {/* Linked tasks, if any */}
        {community.community_tasks?.length > 0 ? (
          <Wrap mb={4}>
            {community.community_tasks.map((ct) => (
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

        {/* Avatar preview */}
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

        {/* Join/Leave button */}
        <Box
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {user && (
            <JoinLeaveButton
              communityId={community.id}
              userId={user.id}
              isMember={isMember}
              onToggle={(joined) =>
                handleToggleMembership(community.id, joined)
              }
            />
          )}
        </Box>
      </Box>
    );
  }

  // ───────────────────────────────────────────────────────────
  // 4) Simple search across all communities
  // ───────────────────────────────────────────────────────────
  const filteredCommunities = searchTerm
    ? communities.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : communities;

  // ───────────────────────────────────────────────────────────
  // 5) Complete onboarding (the "Next" logic)
  // ───────────────────────────────────────────────────────────
  const handleContinue = async () => {
    if (!user?.id) return;
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
      // Move user to next step (Frequency)
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

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box textAlign="center" py={6}>
        <Spinner size="lg" />
      </Box>
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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {/* Single grid of all communities (unified) */}
          {filteredCommunities.length === 0 ? (
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
