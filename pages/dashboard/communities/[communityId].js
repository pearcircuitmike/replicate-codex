// pages/dashboard/communities/[communityId].js
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  SimpleGrid,
  Spinner,
  HStack,
  Avatar,
  Flex,
  Link as ChakraLink,
  Icon,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";

import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import MetaTags from "@/components/MetaTags";
import { getDateRange } from "@/pages/api/utils/dateUtils"; // Make sure this import is correct in your project
import TimeRangeFilter from "@/components/Common/TimeRangeFilter";
import PaperCard from "@/components/Cards/PaperCard";
import CommunityNotesTab from "@/components/Community/CommunityNotesTab";
import JoinLeaveButton from "@/components/Community/JoinLeaveButton";
import InviteUserModal from "@/components/Community/InviteUserModal";
import { useAuth } from "@/context/AuthContext";

export default function CommunityDetailPage() {
  const router = useRouter();
  const { communityId } = router.query;
  const { user } = useAuth();
  const userId = user?.id || null;

  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);

  const [papers, setPapers] = useState([]);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("thisWeek");
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const memberCount = members.length;

  // 1) Fetch community detail
  async function fetchCommunity() {
    if (!communityId) return;
    setLoading(true);
    try {
      const resp = await fetch(`/api/community/${communityId}`);
      if (!resp.ok) {
        throw new Error("Failed to load community info");
      }
      const data = await resp.json();
      setCommunity(data);
    } catch (err) {
      console.error("fetchCommunity error:", err);
    } finally {
      setLoading(false);
    }
  }

  // 2) Fetch members
  async function fetchMembers() {
    if (!communityId) return;
    setLoading(true);
    try {
      const resp = await fetch(`/api/community/${communityId}/members`);
      if (!resp.ok) {
        throw new Error("Failed to load community members");
      }
      const data = await resp.json();
      setMembers(data || []);
    } catch (err) {
      console.error("fetchMembers error:", err);
    } finally {
      setLoading(false);
    }
  }

  // 3) Check if user is a member
  async function checkIsMember() {
    if (!communityId || !userId) {
      setIsMember(false);
      return;
    }
    // Instead of a separate route, we can see if user is in `members`
    // or create a dedicated route. For speed, let's do a quick fetch from membership
    try {
      const resp = await fetch(`/api/community/${communityId}/members`);
      const data = await resp.json();
      const found = data.find((m) => m.id === userId);
      setIsMember(!!found);
    } catch (err) {
      console.error("checkMembership error:", err);
      setIsMember(false);
    }
  }

  // 4) Once we have tasks, fetch papers
  async function fetchPapers() {
    if (!communityId) return;
    setLoading(true);
    try {
      const resp = await fetch(
        `/api/community/${communityId}/papers?timeRange=${selectedTimeRange}`
      );
      if (!resp.ok) {
        throw new Error("Failed to load papers");
      }
      const data = await resp.json();
      setPapers(data || []);
    } catch (err) {
      console.error("fetchPapers error:", err);
    } finally {
      setLoading(false);
    }
  }

  // 5) Fetch comments
  async function fetchComments() {
    if (!communityId) return;
    setLoading(true);
    try {
      const resp = await fetch(
        `/api/community/${communityId}/comments?timeRange=${selectedTimeRange}`
      );
      if (!resp.ok) {
        throw new Error("Failed to load comments");
      }
      const data = await resp.json();
      setComments(data || []);
    } catch (err) {
      console.error("fetchComments error:", err);
    } finally {
      setLoading(false);
    }
  }

  // 6) On first load or when communityId changes
  useEffect(() => {
    if (!communityId) return;
    fetchCommunity();
    fetchMembers();
  }, [communityId]);

  // 7) Once we know user, check membership
  useEffect(() => {
    checkIsMember();
  }, [communityId, userId]);

  // 8) Load the correct tab data
  useEffect(() => {
    if (!community) return;
    if (activeTabIndex === 0) {
      fetchPapers();
    } else if (activeTabIndex === 1) {
      fetchComments();
    }
    // Tab 2 = members, already loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [community, selectedTimeRange, activeTabIndex]);

  function handleToggleMembership(joined) {
    setIsMember(joined);
    // Optionally refetch members if you want an immediate update
    if (joined) {
      fetchMembers();
    } else {
      fetchMembers();
    }
  }

  return (
    <DashboardLayout>
      <Container maxW="container.xl" py={6}>
        <Box mb={4}>
          <ChakraLink
            as={NextLink}
            href="/dashboard/communities"
            color="blue.500"
          >
            <Flex align="center">
              <Icon as={ArrowBackIcon} mr={1} />
              <Text>Back to Communities</Text>
            </Flex>
          </ChakraLink>
        </Box>

        {!community ? (
          loading ? (
            <Spinner size="xl" />
          ) : (
            <Text>Community not found.</Text>
          )
        ) : (
          <>
            <Flex justify="space-between" align="center" mb={2}>
              <Box>
                <Heading as="h1" size="lg" mb={1}>
                  {community.name}
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Created by Mike Young · {memberCount} members
                </Text>
              </Box>

              <HStack spacing={3}>
                {userId && (
                  <InviteUserModal communityId={community.id} userId={userId} />
                )}

                {userId && (
                  <JoinLeaveButton
                    communityId={community.id}
                    userId={userId}
                    isMember={isMember}
                    onToggle={handleToggleMembership}
                  />
                )}
              </HStack>
            </Flex>

            <Text fontSize="md" color="gray.700" mb={4}>
              {community.description || "No description provided."}
            </Text>

            {/* Show tasks */}
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
              <Text fontSize="sm" color="gray.600" mb={4}>
                (No tasks linked)
              </Text>
            )}

            {/* TimeRangeFilter above the tabs */}
            <Box mb={4}>
              <TimeRangeFilter
                selectedTimeRange={selectedTimeRange}
                onTimeRangeChange={setSelectedTimeRange}
              />
            </Box>

            <Tabs
              variant="enclosed"
              colorScheme="blue"
              index={activeTabIndex}
              onChange={setActiveTabIndex}
            >
              <TabList>
                <Tab>Papers</Tab>
                <Tab>Comments</Tab>
                <Tab>Members</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  {loading ? (
                    <Spinner size="lg" />
                  ) : papers.length === 0 ? (
                    <Text>No papers found.</Text>
                  ) : (
                    <SimpleGrid columns={[1, 2, 4, 4]} spacing={6}>
                      {papers.map((paper) => (
                        <PaperCard key={paper.id} paper={paper} />
                      ))}
                    </SimpleGrid>
                  )}
                </TabPanel>

                <TabPanel>
                  {loading ? (
                    <Spinner size="lg" />
                  ) : comments.length === 0 ? (
                    <Text>No comments yet. Start a discussion!</Text>
                  ) : (
                    <CommunityNotesTab notes={comments} />
                  )}
                </TabPanel>

                <TabPanel>
                  {loading ? (
                    <Spinner size="lg" />
                  ) : memberCount === 0 ? (
                    <Text>No members found. Be the first to join!</Text>
                  ) : (
                    <SimpleGrid columns={[1, 2, 3]} spacing={6}>
                      {members.map((m) => (
                        <Box
                          key={m.id}
                          p={4}
                          borderWidth="1px"
                          borderRadius="md"
                        >
                          <HStack spacing={4}>
                            <Avatar
                              src={m.avatar_url || ""}
                              size="sm"
                              name={m.full_name || "User"}
                            />
                            <Text>{m.full_name || "Anonymous"}</Text>
                          </HStack>
                        </Box>
                      ))}
                    </SimpleGrid>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </>
        )}
      </Container>
    </DashboardLayout>
  );
}
