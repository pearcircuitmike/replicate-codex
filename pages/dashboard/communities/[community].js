// pages/dashboard/communities/[community].js

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
import TimeRangeFilter from "@/components/Common/TimeRangeFilter";
import PaperCard from "@/components/Cards/PaperCard";
import CommunityNotesTab from "@/components/Community/CommunityNotesTab";
import JoinLeaveButton from "@/components/Community/JoinLeaveButton";
import InviteUserModal from "@/components/Community/InviteUserModal";
import { useAuth } from "@/context/AuthContext";

export default function CommunityDetailPage() {
  const router = useRouter();
  // "community" is the slug from the URL [community].js
  const { community: slug } = router.query;

  const { user } = useAuth();
  const userId = user?.id || null;

  // We'll store the entire community record (including the real "id")
  const [communityData, setCommunityData] = useState(null);
  const [loadingSlug, setLoadingSlug] = useState(true);

  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [papers, setPapers] = useState([]);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("thisWeek");
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Step A: Slug -> real "id"
  useEffect(() => {
    if (!slug) return;
    async function fetchBySlug() {
      setLoadingSlug(true);
      try {
        const resp = await fetch(
          `/api/community/fetch-community-by-slug?slug=${slug}`
        );
        if (!resp.ok) {
          throw new Error("Community not found by slug");
        }
        const data = await resp.json();
        setCommunityData(data); // data includes .id, .name, .description, etc.
      } catch (err) {
        console.error("Error in slug lookup:", err);
        // Optionally router.push("/404")
      } finally {
        setLoadingSlug(false);
      }
    }
    fetchBySlug();
  }, [slug]);

  // Once we have the real ID, we can do all our standard calls
  const communityId = communityData?.id || null;
  const memberCount = members.length;

  // Step B: fetch members, membership, papers, comments, etc. by ID
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

  async function checkIsMember() {
    if (!communityId || !userId) {
      setIsMember(false);
      return;
    }
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

  // Whenever the ID changes or tab/time range changes
  useEffect(() => {
    if (!communityId) return;
    fetchMembers();
    checkIsMember();
    if (activeTabIndex === 0) {
      fetchPapers();
    } else if (activeTabIndex === 1) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId, activeTabIndex, selectedTimeRange]);

  function handleToggleMembership(joined) {
    setIsMember(joined);
    // Re-fetch members for an immediate UI update
    fetchMembers();
  }

  // Early loading or 404
  if (loadingSlug) {
    return (
      <DashboardLayout>
        <Container maxW="container.xl" py={6}>
          <Spinner size="xl" />
        </Container>
      </DashboardLayout>
    );
  }
  if (!communityData) {
    return (
      <DashboardLayout>
        <Container maxW="container.xl" py={6}>
          <Text>Community not found.</Text>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxW="container.xl" py={6}>
        <MetaTags
          title={communityData.name}
          description={communityData.description || "No description."}
        />

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

        <Flex justify="space-between" align="center" mb={2}>
          <Box>
            <Heading as="h1" size="lg" mb={1}>
              {communityData.name}
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Created by Mike Young · {memberCount} members
            </Text>
          </Box>

          <HStack spacing={3}>
            {userId && (
              <InviteUserModal communityId={communityId} userId={userId} />
            )}
            {userId && (
              <JoinLeaveButton
                communityId={communityId}
                userId={userId}
                isMember={isMember}
                onToggle={handleToggleMembership}
              />
            )}
          </HStack>
        </Flex>

        <Text fontSize="md" color="gray.700" mb={4}>
          {communityData.description || "No description provided."}
        </Text>

        {/* Tasks */}
        {communityData.community_tasks?.length > 0 ? (
          <Wrap mb={4}>
            {communityData.community_tasks.map((ct) => (
              <WrapItem key={ct.id}>
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

        {/* Time Range */}
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
                    <Box key={m.id} p={4} borderWidth="1px" borderRadius="md">
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
      </Container>
    </DashboardLayout>
  );
}
