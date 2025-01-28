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

  // Community ID => up to 5 avatar objects
  const [avatarMap, setAvatarMap] = useState({});

  // Community ID => total membership count
  const [membershipCountMap, setMembershipCountMap] = useState({});

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
      // A) Fetch communities + tasks
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
        setMembershipCountMap({});
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

      // Split into "mine" vs "others"
      const mine = [];
      const others = [];
      for (const c of allComms) {
        if (userMemberSet.has(c.id)) {
          mine.push(c);
        } else {
          others.push(c);
        }
      }

      // C) Fetch all membership rows for these communities
      const commIds = allComms.map((c) => c.id);
      const { data: allRows, error: allRowsErr } = await supabase
        .from("community_members")
        .select("community_id, user_id")
        .in("community_id", commIds)
        .limit(5000);

      if (allRowsErr) throw allRowsErr;

      // Build membershipMap => array of user IDs per community
      const membershipMap = {};
      for (const row of allRows) {
        if (!membershipMap[row.community_id]) {
          membershipMap[row.community_id] = [];
        }
        membershipMap[row.community_id].push(row.user_id);
      }

      // Build the membershipCountMap in memory
      const countMap = {};
      for (const [cId, userIds] of Object.entries(membershipMap)) {
        countMap[cId] = userIds.length;
      }

      // D) Gather all unique user IDs
      const uniqueUserIds = new Set(allRows.map((r) => r.user_id));

      // E) Fetch profile info for those user IDs
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

      // F) Build the avatarMap (first 5 users for each community)
      const newAvatarMap = {};
      for (const cId of Object.keys(membershipMap)) {
        const userIds = membershipMap[cId];
        const topFive = userIds.slice(0, 5);
        newAvatarMap[cId] = topFive.map((uid) => ({
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
      setMembershipCountMap(countMap);
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

    // Up to 5 avatars
    const previewArr = avatarMap[community.id] || [];

    // Real total membership
    const totalMembers = membershipCountMap[community.id] || 0;

    // Shown avatars (up to 5)
    const shown = previewArr.slice(0, 5);
    // Leftover count
    const leftover = totalMembers > 5 ? totalMembers - 5 : 0;

    const handleCardClick = () => {
      router.push(`/dashboard/communities/${community.id}`);
    };

    // Access the tasks
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

        {/* Show tasks if we have any */}
        {commTasks && commTasks.length > 0 ? (
          <Wrap mb={4}>
            {commTasks.map((ct) => (
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

        {/* Updated overlap and spacing */}
        <Flex align="center" mb={3}>
          {shown.map((m) => (
            <Avatar
              key={m.user_id}
              src={m.avatar_url || ""}
              name={m.full_name || "User"}
              size="sm"
              mr={-3} // Overlaps the avatars more
            />
          ))}
          {leftover > 0 && (
            <Text fontSize="sm" color="gray.500" ml={3}>
              +{leftover} more
            </Text>
          )}
        </Flex>

        {/* Join/Leave button */}
        <Box
          onClick={(e) => {
            e.stopPropagation(); // prevent card-click navigation
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
                Communities you’ve already joined
              </Text>
              {myCommunities.length === 0 ? (
                <Text fontSize="sm" mb={6}>
                  You haven’t joined any community yet.
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
