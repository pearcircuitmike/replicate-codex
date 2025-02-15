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
  Center,
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
import Pagination from "@/components/Pagination";
import { useAuth } from "@/context/AuthContext";

export default function CommunityDetailPage() {
  const router = useRouter();
  const { community: slug } = router.query;

  const { user } = useAuth();
  const userId = user?.id || null;

  const [communityData, setCommunityData] = useState(null);
  const [loadingSlug, setLoadingSlug] = useState(true);

  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [papers, setPapers] = useState([]);
  const [comments, setComments] = useState([]);

  // NEW: for highlights
  const [highlights, setHighlights] = useState([]);

  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("thisWeek");
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // NEW: pagination state for papers
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [totalPapersCount, setTotalPapersCount] = useState(0);

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
        setCommunityData(data);
      } catch (err) {
        console.error("Error in slug lookup:", err);
      } finally {
        setLoadingSlug(false);
      }
    }
    fetchBySlug();
  }, [slug]);

  const communityId = communityData?.id || null;
  const memberCount = members.length;

  // Step B: fetch members, membership, papers, comments, highlights, etc. by ID
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
        `/api/community/${communityId}/papers?timeRange=${selectedTimeRange}&page=${currentPage}&pageSize=${pageSize}`
      );
      if (!resp.ok) {
        throw new Error("Failed to load papers");
      }
      // Expecting the API to return an object with "data" and "totalCount"
      const json = await resp.json();
      setPapers(json.data || []);
      setTotalPapersCount(json.totalCount || 0);
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

  // NEW: fetch highlights
  async function fetchHighlights() {
    if (!communityId) return;
    setLoading(true);
    try {
      const resp = await fetch(
        `/api/community/${communityId}/highlights?timeRange=${selectedTimeRange}`
      );
      if (!resp.ok) {
        throw new Error("Failed to load highlights");
      }
      const data = await resp.json();
      setHighlights(data || []);
    } catch (err) {
      console.error("fetchHighlights error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Reset current page when the time range changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTimeRange]);

  useEffect(() => {
    if (!communityId) return;
    fetchMembers();
    checkIsMember();

    // Load data based on the active tab.
    if (activeTabIndex === 0) {
      fetchPapers();
    } else if (activeTabIndex === 1) {
      fetchComments();
    } else if (activeTabIndex === 2) {
      fetchMembers();
    } else if (activeTabIndex === 3) {
      fetchHighlights();
    }
    // Include currentPage in the dependency array for papers.
  }, [communityId, activeTabIndex, selectedTimeRange, currentPage]);

  function handleToggleMembership(joined) {
    setIsMember(joined);
    fetchMembers();
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

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
            <Tab>Highlights</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {loading ? (
                <Spinner size="lg" />
              ) : papers.length === 0 ? (
                <Text>No papers found.</Text>
              ) : (
                <>
                  <SimpleGrid columns={[1, 2, 4, 4]} spacing={6}>
                    {papers.map((paper) => (
                      <PaperCard key={paper.id} paper={paper} />
                    ))}
                  </SimpleGrid>
                  <Center my={5}>
                    <Pagination
                      totalCount={totalPapersCount}
                      pageSize={pageSize}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                      basePath={router.asPath.split("?")[0]}
                      extraQuery={{ timeRange: selectedTimeRange }}
                    />
                  </Center>
                </>
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

            {/* NEW: Highlights tab */}
            <TabPanel>
              {loading ? (
                <Spinner size="lg" />
              ) : highlights.length === 0 ? (
                <Text>No highlights yet. Start highlighting!</Text>
              ) : (
                <Box>
                  {highlights.map((h) => (
                    <Box
                      key={h.id}
                      p={4}
                      mb={4}
                      borderWidth="1px"
                      borderRadius="md"
                    >
                      <HStack mb={2}>
                        <Avatar
                          src={h.userProfile.avatar_url}
                          size="sm"
                          name={h.userProfile.full_name}
                        />
                        <Text fontWeight="bold">{h.userProfile.full_name}</Text>
                      </HStack>
                      <Text color="gray.700">
                        <strong>Paper:</strong>{" "}
                        {h.arxivPapersData?.title || "Unknown Paper"}
                      </Text>
                      <Text mt={2}>
                        <em>{h.prefix}</em>
                        <strong> {h.quote} </strong>
                        <em>{h.suffix}</em>
                      </Text>
                      {h.context_snippet && (
                        <Text mt={2} fontStyle="italic" color="gray.600">
                          Context: {h.context_snippet}
                        </Text>
                      )}
                      <Text mt={2} fontSize="sm" color="gray.500">
                        Highlighted at position: {h.text_position}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </DashboardLayout>
  );
}
