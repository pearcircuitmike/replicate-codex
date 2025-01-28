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
import supabase from "@/pages/api/utils/supabaseClient";

import { getDateRange } from "@/pages/api/utils/dateUtils";
import TimeRangeFilter from "@/components/Common/TimeRangeFilter";
import PaperCard from "@/components/Cards/PaperCard";
import CommunityNotesTab from "@/components/Community/CommunityNotesTab";
import JoinLeaveButton from "@/components/Community/JoinLeaveButton";

// IMPORT the new modal we’ll create
import InviteUserModal from "@/components/Community/InviteUserModal";

export default function CommunityDetailPage() {
  const router = useRouter();
  const { communityId } = router.query;

  const [userId, setUserId] = useState(null);
  const [community, setCommunity] = useState(null);

  // Tab data
  const [papers, setPapers] = useState([]);
  const [comments, setComments] = useState([]);

  // Full member data from public_profile_info
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false); // is current user a member?

  // UI states
  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("thisWeek");
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // 1) On mount, fetch user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        console.error("Error getting user:", error);
      } else if (user) {
        setUserId(user.id);
      }
    });
  }, []);

  // 2) Fetch the community info (including tasks via a nested select)
  const fetchCommunity = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
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
        .eq("id", communityId)
        .single();

      if (error) throw error;
      setCommunity(data);
    } catch (err) {
      console.error("fetchCommunity error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3) Fetch membership => user IDs => public_profile_info
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data: rows, error: memErr } = await supabase
        .from("community_members")
        .select("user_id")
        .eq("community_id", communityId)
        .limit(2000);
      if (memErr) throw memErr;

      const userIds = rows.map((r) => r.user_id);
      if (userIds.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      const { data: profRows, error: profErr } = await supabase
        .from("public_profile_info")
        .select("id, full_name, avatar_url, username")
        .in("id", userIds)
        .limit(2000);
      if (profErr) throw profErr;

      setMembers(profRows || []);
    } catch (err) {
      console.error("fetchMembers error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 4) Check if user is a member
  const checkMembership = async () => {
    if (!communityId || !userId) return;
    try {
      const { data, error } = await supabase
        .from("community_members")
        .select("id")
        .eq("community_id", communityId)
        .eq("user_id", userId)
        .single();

      // error.code === 'PGRST116' means no rows found
      if (error && error.code !== "PGRST116") throw error;
      setIsMember(!!data);
    } catch (err) {
      console.error("checkMembership error:", err);
    }
  };

  // 5) On first load, fetch community + members
  useEffect(() => {
    if (!communityId) return;
    fetchCommunity();
    fetchMembers();
  }, [communityId]);

  // Once user is known, check membership
  useEffect(() => {
    if (communityId && userId) {
      checkMembership();
    }
  }, [communityId, userId]);

  // 6) fetch tasks => then fetch papers or comments
  const fetchTaskIds = async () => {
    const { data, error } = await supabase
      .from("community_tasks")
      .select("task_id")
      .eq("community_id", communityId)
      .limit(1000);
    if (error) throw error;
    return data.map((row) => row.task_id);
  };

  // 6A) fetchPapers
  const fetchPapers = async () => {
    setLoading(true);
    try {
      const taskIds = await fetchTaskIds();
      if (taskIds.length === 0) {
        setPapers([]);
        setLoading(false);
        return;
      }

      let q = supabase
        .from("arxivPapersData")
        .select(
          `
          id, slug, title, authors,
          generatedSummary, publishedDate, "totalScore",
          indexedDate, thumbnail, platform
        `
        )
        .overlaps("task_ids", taskIds)
        .order("totalScore", { ascending: false })
        .limit(200);

      const { startDate, endDate } = getDateRange(selectedTimeRange);
      if (startDate && endDate) {
        q = q
          .gte("publishedDate", startDate.toISOString())
          .lte("publishedDate", endDate.toISOString());
      }

      const { data, error } = await q;
      if (error) throw error;
      setPapers(data || []);
    } catch (err) {
      console.error("fetchPapers error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 6B) fetchComments
  const fetchComments = async () => {
    setLoading(true);
    try {
      // 1) Which papers are relevant?
      const taskIds = await fetchTaskIds();
      if (taskIds.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }

      let pq = supabase
        .from("arxivPapersData")
        .select("id")
        .overlaps("task_ids", taskIds)
        .order("totalScore", { ascending: false })
        .limit(200);

      const { startDate, endDate } = getDateRange(selectedTimeRange);
      if (startDate && endDate) {
        pq = pq
          .gte("publishedDate", startDate.toISOString())
          .lte("publishedDate", endDate.toISOString());
      }

      const { data: relevantPapers, error: rpError } = await pq;
      if (rpError) throw rpError;

      const paperIds = relevantPapers.map((p) => p.id);
      if (paperIds.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }

      // 2) Fetch notes for these paper IDs
      const { data: rawNotes, error: notesErr } = await supabase
        .from("notes")
        .select(
          `
          id,
          paper_id,
          user_id,
          note_text,
          created_at
        `
        )
        .in("paper_id", paperIds)
        .order("created_at", { ascending: false })
        .limit(200);

      if (notesErr) throw notesErr;
      if (!rawNotes || rawNotes.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }

      // 3) Gather user IDs
      const userIds = new Set(rawNotes.map((n) => n.user_id));
      // 4) Gather paper IDs
      const notePaperIds = new Set(rawNotes.map((n) => n.paper_id));

      // 5) Fetch user profiles
      const { data: profileRows, error: profErr } = await supabase
        .from("public_profile_info")
        .select("id, full_name, avatar_url, username")
        .in("id", [...userIds]);

      if (profErr) throw profErr;

      const profileMap = {};
      (profileRows || []).forEach((p) => {
        profileMap[p.id] = {
          avatar_url: p.avatar_url || "",
          full_name: p.full_name || "Anonymous",
          username: p.username || "",
        };
      });

      // 6) Fetch minimal paper info for each note
      const { data: paperRows, error: paperErr } = await supabase
        .from("arxivPapersData")
        .select("id, title, slug, platform")
        .in("id", [...notePaperIds]);

      if (paperErr) throw paperErr;

      const paperMap = {};
      (paperRows || []).forEach((paper) => {
        paperMap[paper.id] = {
          title: paper.title,
          slug: paper.slug,
          platform: paper.platform,
        };
      });

      // 7) Merge userProfile + arxivPapersData into each note
      const mergedNotes = rawNotes.map((n) => ({
        ...n,
        userProfile: profileMap[n.user_id] || {
          avatar_url: "",
          full_name: "Anonymous",
        },
        arxivPapersData: paperMap[n.paper_id] || null,
      }));

      setComments(mergedNotes);
    } catch (err) {
      console.error("fetchComments error:", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // 7) Load data when the user changes tab or time
  const loadTabData = async (tabIndex) => {
    switch (tabIndex) {
      case 0:
        await fetchPapers();
        break;
      case 1:
        await fetchComments();
        break;
      case 2:
        // membership data was fetched on page load
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (community) {
      loadTabData(activeTabIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [community, selectedTimeRange, activeTabIndex]);

  // 8) Toggling membership
  const handleToggleMembership = (joined) => {
    setIsMember(joined);
    // Optionally re-fetch members if needed
  };

  const memberCount = members.length;

  // Pull out the tasks array
  const commTasks = community?.community_tasks || [];

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
                {/* We insert the new InviteUserModal here */}
                {userId && (
                  <InviteUserModal communityId={community.id} userId={userId} />
                )}

                {/* Existing membership button */}
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

            {/* Show tasks here */}
            {commTasks.length > 0 ? (
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
                {/* Tab 0: PAPERS */}
                <TabPanel>
                  {loading ? (
                    <Spinner size="lg" />
                  ) : papers.length === 0 ? (
                    <Text>No papers found.</Text>
                  ) : (
                    <SimpleGrid columns={[1, 1, 2, 2]} spacing={6}>
                      {papers.map((paper) => (
                        <PaperCard key={paper.id} paper={paper} />
                      ))}
                    </SimpleGrid>
                  )}
                </TabPanel>

                {/* Tab 1: COMMENTS */}
                <TabPanel>
                  {loading ? (
                    <Spinner size="lg" />
                  ) : comments.length === 0 ? (
                    <Text>No comments yet. Start a discussion!</Text>
                  ) : (
                    <CommunityNotesTab notes={comments} />
                  )}
                </TabPanel>

                {/* Tab 2: MEMBERS */}
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
