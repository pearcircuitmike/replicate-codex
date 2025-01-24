// /pages/dashboard/communities/index.js

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
  useToast,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import MetaTags from "@/components/MetaTags";
import supabase from "@/pages/api/utils/supabaseClient";
import JoinLeaveButton from "@/components/Community/JoinLeaveButton";

export default function CommunitiesPage() {
  const toast = useToast();
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // My vs. other communities
  const [myCommunities, setMyCommunities] = useState([]);
  const [otherCommunities, setOtherCommunities] = useState([]);

  // Keep track of which communities the user is in
  const [memberSet, setMemberSet] = useState(new Set());

  // For avatar previews
  const [avatarMap, setAvatarMap] = useState({});

  //=============================================================
  // 1) On mount, get user
  //=============================================================
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data: { user }, error }) => {
        if (error) {
          console.error("Error getting user:", error);
          toast({ title: "Not logged in", status: "error" });
        } else if (user) {
          setUserId(user.id);
        }
      })
      .catch((err) => console.error("Auth error:", err));
  }, [toast]);

  //=============================================================
  // 2) Once we know userId, load communities
  //=============================================================
  useEffect(() => {
    if (!userId) return;
    loadCommunitiesData();
  }, [userId]);

  const loadCommunitiesData = async () => {
    setLoading(true);
    try {
      // A) Fetch communities + tasks in one query
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
        .order("created_at", { ascending: false })
        .limit(100);

      if (commErr) throw commErr;

      if (!allComms || allComms.length === 0) {
        setMyCommunities([]);
        setOtherCommunities([]);
        setMemberSet(new Set());
        setAvatarMap({});
        setLoading(false);
        return;
      }

      // B) Fetch membership for the user
      const { data: memberships, error: memErr } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", userId)
        .limit(2000);

      if (memErr) throw memErr;

      const userMemberSet = new Set(memberships.map((m) => m.community_id));

      // Partition "my communities" vs. "others"
      const mine = [];
      const others = [];
      for (const c of allComms) {
        if (userMemberSet.has(c.id)) {
          mine.push(c);
        } else {
          others.push(c);
        }
      }

      // C) For avatar previews, gather membership data
      const commIds = allComms.map((c) => c.id);
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

      // Build a profile lookup map
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
      setMemberSet(userMemberSet);
      setMyCommunities(mine);
      setOtherCommunities(others);
      setAvatarMap(newAvatarMap);
    } catch (err) {
      console.error("loadCommunitiesData error:", err);
      toast({ title: "Error loading communities", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  //=============================================================
  // 3) Handle toggle membership
  //=============================================================
  const handleToggleMembership = (communityId, joined) => {
    const newSet = new Set(memberSet);
    if (joined) {
      newSet.add(communityId);
      // Move from "others" => "mine"
      const found = otherCommunities.find((c) => c.id === communityId);
      if (found) {
        setMyCommunities((curr) => [...curr, found]);
        setOtherCommunities((curr) => curr.filter((c) => c.id !== communityId));
      }
    } else {
      newSet.delete(communityId);
      // Move from "mine" => "others"
      const found = myCommunities.find((c) => c.id === communityId);
      if (found) {
        setOtherCommunities((curr) => [...curr, found]);
        setMyCommunities((curr) => curr.filter((c) => c.id !== communityId));
      }
    }
    setMemberSet(newSet);
  };

  //=============================================================
  // Community card
  //=============================================================
  function CommunityCard({ community }) {
    const isMember = memberSet.has(community.id);
    const previewArr = avatarMap[community.id] || [];

    // Show up to 3 avatar previews
    const shown = previewArr.slice(0, 3);
    const leftover = previewArr.length > 3 ? previewArr.length - 3 : 0;

    const handleCardClick = () => {
      router.push(`/dashboard/communities/${community.id}`);
    };

    // Access the tasks array
    const { community_tasks: commTasks } = community;

    return (
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="md"
        bg="white"
        boxShadow="sm"
        cursor="pointer"
        onClick={handleCardClick}
        _hover={{ bg: "gray.50" }}
      >
        <Heading as="h3" size="md" mb={1}>
          {community.name}
        </Heading>
        <Text fontSize="xs" color="gray.500" mb={1}>
          Created by Mike Young
        </Text>

        <Text fontSize="sm" color="gray.700" mb={2}>
          {community.description || "No description provided."}
        </Text>

        {/* Display tasks if we have any */}
        {commTasks && commTasks.length > 0 ? (
          <>
            <Wrap mb={4}>
              {commTasks.map((ct) => (
                <WrapItem key={ct.task_id}>
                  <Tag variant="subtle" colorScheme="blue">
                    <TagLabel>{ct.tasks?.task || "Unknown Task"}</TagLabel>
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          </>
        ) : (
          <Text fontSize="sm" color="gray.500" mb={3}>
            (No tasks linked)
          </Text>
        )}

        <Flex align="center" mb={3}>
          {shown.map((m) => (
            <Avatar
              key={m.user_id}
              src={m.avatar_url || ""}
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
          {userId && (
            <JoinLeaveButton
              communityId={community.id}
              userId={userId}
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

  //=============================================================
  // Render
  //=============================================================
  return (
    <>
      <MetaTags
        title="Communities"
        description="Join AI communities and discover new research groups"
      />
      <DashboardLayout>
        <Container maxW="container.xl" py={8}>
          <Heading as="h1" size="lg" mb={4}>
            Communities
          </Heading>

          {loading ? (
            <Spinner size="xl" />
          ) : (
            <>
              <Heading as="h2" size="md" mb={2}>
                My Communities
              </Heading>
              <Text fontSize="sm" color="gray.500" mb={4}>
                Communities you&apos;ve already joined
              </Text>
              {myCommunities.length === 0 ? (
                <Text fontSize="sm" mb={6}>
                  You haven&apos;t joined any community yet.
                </Text>
              ) : (
                <SimpleGrid columns={[1, 2, 2, 3]} spacing={4} mb={8}>
                  {myCommunities.map((c) => (
                    <CommunityCard key={c.id} community={c} />
                  ))}
                </SimpleGrid>
              )}

              <Divider mb={8} />

              <Heading as="h2" size="md" mb={2}>
                Explore Communities
              </Heading>
              <Text fontSize="sm" color="gray.500" mb={4}>
                Discover new communities in your field
              </Text>
              {otherCommunities.length === 0 ? (
                <Text fontSize="sm">
                  No other communities are available right now.
                </Text>
              ) : (
                <SimpleGrid columns={[1, 2, 2, 3]} spacing={4}>
                  {otherCommunities.map((c) => (
                    <CommunityCard key={c.id} community={c} />
                  ))}
                </SimpleGrid>
              )}
            </>
          )}
        </Container>
      </DashboardLayout>
    </>
  );
}
