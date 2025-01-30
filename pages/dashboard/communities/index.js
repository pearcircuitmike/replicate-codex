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
import { useAuth } from "@/context/AuthContext";
import JoinLeaveButton from "@/components/Community/JoinLeaveButton";

export default function CommunitiesPage() {
  const toast = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id || null;

  const [loading, setLoading] = useState(true);
  const [myCommunities, setMyCommunities] = useState([]);
  const [otherCommunities, setOtherCommunities] = useState([]);
  const [memberSet, setMemberSet] = useState(new Set());
  const [avatarMap, setAvatarMap] = useState({});
  const [membershipCountMap, setMembershipCountMap] = useState({});

  useEffect(() => {
    if (!userId) {
      setMyCommunities([]);
      setOtherCommunities([]);
      setAvatarMap({});
      setMembershipCountMap({});
      setMemberSet(new Set());
      setLoading(false);
      return;
    }
    loadCommunities();
  }, [userId]);

  async function loadCommunities() {
    setLoading(true);
    try {
      const resp = await fetch(`/api/community/list?userId=${userId}`);
      if (!resp.ok) {
        throw new Error("Failed to load communities");
      }
      const data = await resp.json();

      setMyCommunities(data.myCommunities || []);
      setOtherCommunities(data.otherCommunities || []);
      setAvatarMap(data.avatarMap || {});
      setMembershipCountMap(data.membershipCountMap || {});

      const mySet = new Set((data.myCommunities || []).map((c) => c.id));
      setMemberSet(mySet);
    } catch (err) {
      console.error("loadCommunities error:", err);
      toast({ title: "Error loading communities", status: "error" });
    } finally {
      setLoading(false);
    }
  }

  // Called when the user joins or leaves a community
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

  function CommunityCard({ community }) {
    const isMember = memberSet.has(community.id);
    const previewArr = avatarMap[community.id] || [];
    const totalMembers = membershipCountMap[community.id] || 0;
    const shown = previewArr.slice(0, 5);
    const leftover = totalMembers > 5 ? totalMembers - 5 : 0;

    const router = useRouter();
    const handleCardClick = () => {
      router.push(`/dashboard/communities/${community.id}`);
    };

    return (
      <Box
        borderWidth="1px"
        borderRadius="md"
        bg="white"
        boxShadow="sm"
        _hover={{ bg: "gray.50" }}
      >
        {/* 
          Use a Flex column that stretches the full height of the card.
          "justifyContent='space-between'" pushes the button box to the bottom.
        */}
        <Flex
          direction="column"
          justifyContent="space-between"
          height="100%"
          p={4}
        >
          {/* Top portion: everything except the button. Clickable. */}
          <Box cursor="pointer" onClick={handleCardClick}>
            <Heading as="h3" size="md" mb={1}>
              {community.name}
            </Heading>
            <Text fontSize="xs" color="gray.500" mb={1}>
              Created by Mike Young
            </Text>

            <Text fontSize="sm" color="gray.700" mb={2}>
              {community.description || "No description provided."}
            </Text>

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

            <Flex align="center">
              {shown.map((m) => (
                <Avatar
                  key={m.user_id}
                  src={m.avatar_url}
                  name={m.full_name}
                  size="sm"
                  mr={-3}
                />
              ))}
              {leftover > 0 && (
                <Text fontSize="sm" color="gray.500" ml={3}>
                  + {leftover}
                </Text>
              )}
            </Flex>
          </Box>

          {/* Bottom portion: The button on the left. Stop event propagation here. */}
          {userId && (
            <Box
              mt={4}
              alignSelf="flex-start"
              onClick={(e) => e.stopPropagation()}
            >
              <JoinLeaveButton
                communityId={community.id}
                userId={userId}
                isMember={isMember}
                onToggle={handleToggleMembership}
              />
            </Box>
          )}
        </Flex>
      </Box>
    );
  }

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
                <Text fontSize="sm">No other communities are available.</Text>
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
