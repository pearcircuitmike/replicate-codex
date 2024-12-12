import React, { useState, useEffect, useRef } from "react";
import {
  VStack,
  Text,
  Box,
  Spinner,
  SimpleGrid,
  Container,
  Button,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Progress,
  Flex,
  List,
  ListItem,
  IconButton,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import supabase from "@/pages/api/utils/supabaseClient";
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { TopicCard } from "@/components/TopicCard";
import { SelectedTopics } from "@/components/SelectedTopics";

const SearchSuggestion = ({ task, onSelect, isActive }) => (
  <ListItem
    px={4}
    py={2}
    cursor="pointer"
    bg={isActive ? "blue.50" : "transparent"}
    _hover={{ bg: "blue.50" }}
    onClick={() => onSelect(task)}
    display="flex"
    alignItems="center"
    gap={3}
  >
    <Text fontSize="xl">{task.task_emoji}</Text>
    <Box>
      <Text fontWeight={isActive ? "semibold" : "normal"}>{task.task}</Text>
      <Text fontSize="sm" color="gray.500">
        {task.task_category}
      </Text>
    </Box>
  </ListItem>
);

const TopicSelectionPage = () => {
  const [tasks, setTasks] = useState([]);
  const [displayedTasks, setDisplayedTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const inputRef = useRef(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const getMaxDisplayCount = () => (isMobile ? 4 : 8);
  const totalPages = Math.ceil(tasks.length / getMaxDisplayCount());

  useEffect(() => {
    const updateDisplayedTasks = () => {
      const maxDisplay = getMaxDisplayCount();
      const start = currentPage * maxDisplay;
      const currentTasks = searchTerm ? getSuggestions(searchTerm) : tasks;

      if (searchTerm) {
        setDisplayedTasks(currentTasks.slice(0, maxDisplay));
        setCurrentPage(0);
      } else {
        setDisplayedTasks(currentTasks.slice(start, start + maxDisplay));
      }
    };

    updateDisplayedTasks();
  }, [currentPage, searchTerm, tasks]);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      if (newIsMobile !== isMobile) {
        window.location.reload();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.id) return;

      try {
        // Step 1: Fetch all tasks
        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("id, task, task_category, task_emoji, task_description");

        if (tasksError) {
          console.error("Error fetching tasks:", tasksError);
          return;
        }

        // Step 2: Fetch paper counts for all tasks
        const { data: paperCounts, error: countsError } = await supabase
          .from("arxivPapersData")
          .select("task_ids");

        if (countsError) {
          console.error("Error fetching paper counts:", countsError);
          return;
        }

        // Step 3: Calculate paper counts
        const paperCountMap = {};
        paperCounts.forEach((paper) => {
          paper.task_ids?.forEach((taskId) => {
            if (!paperCountMap[taskId]) paperCountMap[taskId] = 0;
            paperCountMap[taskId] += 1;
          });
        });

        // Step 4: Add paper counts and follow status to tasks
        const { data: followedTasks, error: followedError } = await supabase
          .from("followed_tasks")
          .select("task_id")
          .eq("user_id", user.id);

        if (followedError) {
          console.error("Error fetching followed tasks:", followedError);
          return;
        }

        const followedTaskIds = new Set(
          followedTasks?.map((ft) => ft.task_id) || []
        );

        const tasksWithDetails = tasks.map((task) => ({
          ...task,
          paperCount: paperCountMap[task.id] || 0,
          isFollowed: followedTaskIds.has(task.id),
        }));

        const shuffled = [...tasksWithDetails].sort(() => Math.random() - 0.5);
        setTasks(shuffled);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id]);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleTaskToggle = async (taskId) => {
    if (!user?.id) return;

    const task = tasks.find((t) => t.id === taskId);
    const newFollowStatus = !task.isFollowed;

    setTasks((currentTasks) =>
      currentTasks.map((t) =>
        t.id === taskId ? { ...t, isFollowed: newFollowStatus } : t
      )
    );

    setDisplayedTasks((currentTasks) =>
      currentTasks.map((t) =>
        t.id === taskId ? { ...t, isFollowed: newFollowStatus } : t
      )
    );

    try {
      const endpoint = newFollowStatus
        ? "/api/tasks/add-followed-task"
        : "/api/tasks/remove-followed-task";
      const method = newFollowStatus ? "POST" : "DELETE";

      await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ taskId }),
      });
    } catch (error) {
      console.error("Error toggling topic:", error);
    }
  };

  const handleContinue = async () => {
    try {
      // Ensure topics are selected and onboarding step is updated
      await fetch("/api/onboarding/complete-topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      // Navigate to Frequency Page
      router.push("/onboarding/frequency");
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSkip = async () => {
    try {
      await fetch("/api/onboarding/complete-topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      router.push("/onboarding/frequency");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
    }
  };

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();

    if (!inputValue) {
      return tasks.slice(0, 8);
    }

    const startsWith = tasks.filter((task) =>
      task.task.toLowerCase().startsWith(inputValue)
    );

    const contains = tasks.filter(
      (task) =>
        !task.task.toLowerCase().startsWith(inputValue) &&
        task.task.toLowerCase().includes(inputValue)
    );

    return [...startsWith, ...contains].slice(0, 8);
  };

  const suggestions = getSuggestions(searchTerm);

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (suggestions[activeIndex]) {
          handleSuggestionSelect(suggestions[activeIndex]);
        }
        break;
      case "Tab":
        if (suggestions[activeIndex]) {
          e.preventDefault();
          handleSuggestionSelect(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSearchFocus = () => {
    setActiveIndex(0);
    setIsOpen(true);
  };

  const handleSearchBlur = (e) => {
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleSuggestionSelect = (task) => {
    handleTaskToggle(task.id);
    setSearchTerm("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  if (!user?.id || isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Container maxW="5xl" py={8}>
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ChevronLeftIcon />}
            onClick={() => router.push("/onboarding/roles")}
          >
            Back
          </Button>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Step 2 of 4 - Choose Topics
          </Text>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ChevronRightIcon />}
            onClick={handleContinue}
          >
            Next
          </Button>
        </Flex>
        <Progress value={50} size="sm" colorScheme="blue" borderRadius="full" />
      </Box>

      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={3}>
            What research areas interest you?
          </Heading>
          <Text color="gray.600" fontSize="lg" mb={6}>
            We&apos;ll create a personalized feed of the latest breakthroughs
          </Text>

          {/* Selected Topics Row */}

          <SelectedTopics tasks={tasks} onToggle={handleTaskToggle} />
        </Box>
        <Box position="relative">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              ref={inputRef}
              placeholder="Search research topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onKeyDown={handleKeyDown}
              size="lg"
              borderRadius="lg"
            />
          </InputGroup>
          {isOpen && (
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              mt={2}
              bg="white"
              maxH="400px"
              overflowY="auto"
              shadow="lg"
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.200"
              zIndex={10}
            >
              <List spacing={0}>
                {suggestions.map((task, index) => (
                  <SearchSuggestion
                    key={task.id}
                    task={task}
                    isActive={index === activeIndex}
                    onSelect={handleSuggestionSelect}
                  />
                ))}
              </List>
            </Box>
          )}
        </Box>

        <Box position="relative">
          {!isMobile && !searchTerm && currentPage > 0 && (
            <IconButton
              aria-label="Previous page"
              icon={<ChevronLeftIcon />}
              onClick={handlePrevPage}
              position="absolute"
              left="-16"
              top="50%"
              transform="translateY(-50%)"
              colorScheme="gray"
              variant="ghost"
              size="lg"
              fontSize="24px"
            />
          )}

          <SimpleGrid columns={[1, 1, 2, 4]} spacing={6}>
            {displayedTasks.map((task) => (
              <TopicCard
                key={task.id}
                task={task}
                isSelected={task.isFollowed}
                onToggle={handleTaskToggle}
              />
            ))}
          </SimpleGrid>

          {!isMobile && !searchTerm && currentPage < totalPages - 1 && (
            <IconButton
              aria-label="Next page"
              icon={<ChevronRightIcon />}
              onClick={handleNextPage}
              position="absolute"
              right="-16"
              top="50%"
              transform="translateY(-50%)"
              colorScheme="gray"
              variant="ghost"
              size="lg"
              fontSize="24px"
            />
          )}
        </Box>

        <Flex justify="space-between" pt={6}>
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button colorScheme="blue" onClick={handleContinue} size="lg" px={8}>
            Continue
          </Button>
        </Flex>
      </VStack>
    </Container>
  );
};

export default TopicSelectionPage;
