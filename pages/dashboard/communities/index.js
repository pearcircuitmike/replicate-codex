// pages/dashboard/communities/index.js

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
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Button,
  Center,
  Icon,
} from "@chakra-ui/react";
import { SearchIcon, WarningIcon, BellIcon, ChatIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import MetaTags from "@/components/MetaTags";
import { useAuth } from "@/context/AuthContext";
import JoinLeaveButton from "@/components/Community/JoinLeaveButton";
import useSWR from "swr";

export default function CommunitiesPage() {
  const toast = useToast();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id || null;
  const [searchTerm, setSearchTerm] = useState("");
  const [memberSet, setMemberSet] = useState(new Set());

  // Set initial data for less flickering
  const initialData = {
    myCommunities: [],
    otherCommunities: [],
    avatarMap: {},
    membershipCountMap: {},
  };

  // Prevent fetching until auth is ready
  const shouldFetch = !authLoading && userId;

  // Data fetching with SWR
  const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load communities");
    return res.json();
  };

  const { data, error, mutate } = useSWR(
    shouldFetch ? `/api/community/list?userId=${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
      keepPreviousData: true,
      fallbackData: initialData,
    }
  );

  const isLoading = !data && !error && shouldFetch;
  const myCommunities = data?.myCommunities || [];
  const otherCommunities = data?.otherCommunities || [];
  const avatarMap = data?.avatarMap || {};
  const membershipCountMap = data?.membershipCountMap || {};

  // Set memberSet once data is loaded
  useEffect(() => {
    if (data?.myCommunities?.length > 0) {
      const mySet = new Set(data.myCommunities.map((c) => c.id));
      setMemberSet(mySet);
    }
  }, [data?.myCommunities]);

  const handleToggleMembership = (communityId, joined) => {
    const newSet = new Set(memberSet);

    if (joined) {
      newSet.add(communityId);
      // Optimistically update UI
      const found = otherCommunities.find((c) => c.id === communityId);
      if (found) {
        const newMyCommunities = [...myCommunities, found];
        const newOtherCommunities = otherCommunities.filter(
          (x) => x.id !== communityId
        );
        mutate(
          {
            ...data,
            myCommunities: newMyCommunities,
            otherCommunities: newOtherCommunities,
          },
          { revalidate: false }
        );
      }
    } else {
      newSet.delete(communityId);
      // Optimistically update UI
      const found = myCommunities.find((c) => c.id === communityId);
      if (found) {
        const newOtherCommunities = [...otherCommunities, found];
        const newMyCommunities = myCommunities.filter(
          (x) => x.id !== communityId
        );
        mutate(
          {
            ...data,
            myCommunities: newMyCommunities,
            otherCommunities: newOtherCommunities,
          },
          { revalidate: false }
        );
      }
    }

    setMemberSet(newSet);
  };

  function matchesSearch(community, term) {
    if (!term) return true;
    const lower = term.toLowerCase();
    if (community.name?.toLowerCase().includes(lower)) return true;
    if (community.description?.toLowerCase().includes(lower)) return true;
    if (community.community_tasks?.length > 0) {
      for (const ct of community.community_tasks) {
        const taskName = ct.tasks?.task?.toLowerCase() || "";
        if (taskName.includes(lower)) return true;
      }
    }
    return false;
  }

  const filteredMyCommunities = myCommunities.filter((c) =>
    matchesSearch(c, searchTerm)
  );
  const filteredOtherCommunities = otherCommunities.filter((c) =>
    matchesSearch(c, searchTerm)
  );

  function CommunityCard({ community, isLoading }) {
    const isMember = memberSet.has(community.id);
    const previewArr = avatarMap[community.id] || [];
    const totalMembers = membershipCountMap[community.id] || 0;
    const shown = previewArr.slice(0, 5);
    const leftover = totalMembers > 5 ? totalMembers - 5 : 0;

    // Important: use the slug for routing
    const handleCardClick = () => {
      router.push(`/dashboard/communities/${community.slug}`);
    };

    if (isLoading) {
      return (
        <Box
          borderWidth="1px"
          borderRadius="md"
          bg="white"
          boxShadow="sm"
          height="100%"
        >
          <Flex direction="column" height="100%" p={4}>
            <Skeleton height="24px" width="70%" mb={2} />
            <Skeleton height="16px" width="40%" mb={3} />
            <Skeleton height="60px" mb={4} />
            <Skeleton height="24px" width="50%" />
          </Flex>
        </Box>
      );
    }

    return (
      <Box
        borderWidth="1px"
        borderRadius="md"
        bg="white"
        boxShadow="sm"
        _hover={{ bg: "gray.50" }}
      >
        <Flex direction="column" height="100%" p={4}>
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
            ) : null}

            <Flex align="center">
              {shown.map((m) => (
                <Avatar
                  key={m.user_id}
                  src={m.avatar_url}
                  name={m.full_name}
                  size="sm"
                  mr={-2}
                />
              ))}
              {leftover > 0 && (
                <Text fontSize="sm" color="gray.500" ml={4}>
                  {" "}
                  + {leftover}
                </Text>
              )}
            </Flex>
          </Box>

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

  // Skeleton loader for cards
  const SkeletonCard = () => (
    <Box borderWidth="1px" borderRadius="md" bg="white" boxShadow="sm">
      <Flex direction="column" p={4}>
        <Skeleton height="24px" width="70%" mb={2} />
        <Skeleton height="16px" width="40%" mb={3} />
        <Skeleton height="60px" mb={4} />
        <Skeleton height="24px" width="50%" />
      </Flex>
    </Box>
  );

  const renderSkeletonGrid = (count) => (
    <SimpleGrid columns={[1, 2, 2, 3]} spacing={4} mb={8}>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <SkeletonCard key={i} />
        ))}
    </SimpleGrid>
  );

  // Improved empty state component that matches the screenshot
  const EmptyCommunitiesState = () => (
    <Box p={6} borderWidth="1px" borderRadius="md" bg="orange.50" mb={6}>
      <Flex direction="column" align="center" mb={4}>
        <WarningIcon boxSize={6} color="orange.500" mb={1} />
        <Heading size="md" color="orange.800" textAlign="center">
          You haven't joined any communities yet
        </Heading>
        <Text color="gray.700" textAlign="center" mt={1}>
          Without communities, you're missing out on important updates and
          discussions
        </Text>
      </Flex>

      <SimpleGrid columns={[1, null, 2]} spacing={6} mb={6}>
        <Flex direction="column" align="center" textAlign="center">
          <Center boxSize="10" mb={2}>
            <Icon as={BellIcon} color="orange.500" boxSize={5} />
          </Center>
          <Heading size="sm" mb={1} color="orange.800">
            No Paper Notifications
          </Heading>
          <Text fontSize="sm" color="gray.600">
            You won't be notified when new research papers are published
          </Text>
        </Flex>

        <Flex direction="column" align="center" textAlign="center">
          <Center boxSize="10" mb={2}>
            <Icon as={ChatIcon} color="orange.500" boxSize={5} />
          </Center>
          <Heading size="sm" mb={1} color="orange.800">
            Missing Discussions
          </Heading>
          <Text fontSize="sm" color="gray.600">
            You'll miss discussions and comments from fellow users
          </Text>
        </Flex>
      </SimpleGrid>

      <Center>
        <Button
          colorScheme="blue"
          onClick={() =>
            document
              .getElementById("explore-communities")
              .scrollIntoView({ behavior: "smooth" })
          }
        >
          Choose a community
        </Button>
      </Center>
    </Box>
  );

  return (
    <>
      <MetaTags title="Communities" description="Join AI communities" />
      <DashboardLayout>
        <Container maxW="container.xl" py={8}>
          <Heading as="h1" size="lg" mb={4}>
            Communities
          </Heading>

          <Box mb={6}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                isDisabled={isLoading || authLoading}
              />
            </InputGroup>
          </Box>

          {authLoading ? (
            <>
              <Skeleton height="24px" width="150px" mb={6} />
              {renderSkeletonGrid(3)}

              <Divider mb={8} />

              <Skeleton height="24px" width="180px" mb={6} />
              {renderSkeletonGrid(3)}
            </>
          ) : error ? (
            <Text color="red.500">
              Error loading communities. Please try again.
            </Text>
          ) : (
            <>
              {/* My Communities */}
              <Heading as="h2" size="md" mb={2}>
                My Communities
              </Heading>
              <Text fontSize="sm" color="gray.500" mb={4}>
                Communities you already joined
              </Text>

              {isLoading ? (
                renderSkeletonGrid(3)
              ) : myCommunities.length === 0 ? (
                <EmptyCommunitiesState />
              ) : filteredMyCommunities.length === 0 && searchTerm ? (
                <Text fontSize="sm" mb={6}>
                  No matching communities found for "{searchTerm}".
                </Text>
              ) : filteredMyCommunities.length === 0 ? (
                <EmptyCommunitiesState />
              ) : (
                <SimpleGrid columns={[1, 2, 2, 3]} spacing={4} mb={8}>
                  {filteredMyCommunities.map((c) => (
                    <CommunityCard key={c.id} community={c} isLoading={false} />
                  ))}
                </SimpleGrid>
              )}

              <Divider mb={8} />

              {/* Explore Communities */}
              <Heading as="h2" size="md" mb={2} id="explore-communities">
                Explore Communities
              </Heading>
              <Text fontSize="sm" color="gray.500" mb={4}>
                Discover new communities in your field
              </Text>

              {isLoading ? (
                renderSkeletonGrid(3)
              ) : filteredOtherCommunities.length === 0 && searchTerm ? (
                <Text fontSize="sm">
                  No matching communities found for "{searchTerm}".
                </Text>
              ) : filteredOtherCommunities.length === 0 ? (
                <Text fontSize="sm">
                  No communities found right now. Check back later.
                </Text>
              ) : (
                <SimpleGrid columns={[1, 2, 2, 3]} spacing={4}>
                  {filteredOtherCommunities.map((c) => (
                    <CommunityCard key={c.id} community={c} isLoading={false} />
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
