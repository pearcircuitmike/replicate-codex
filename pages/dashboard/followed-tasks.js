import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  SimpleGrid,
  IconButton,
  useMediaQuery,
  VStack,
} from "@chakra-ui/react";
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import FollowedTasksComponent from "@/components/Dashboard/Views/FollowedTasksComponent";
import { SelectedTopics } from "@/components/SelectedTopics";
import { TopicCard } from "@/components/TopicCard";
import { useAuth } from "@/context/AuthContext";
import supabase from "@/pages/api/utils/supabaseClient";

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
        {task.task_description}
      </Text>
    </Box>
  </ListItem>
);

const FollowedTasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [displayedTasks, setDisplayedTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const isMobile = !isLargerThan768;

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
    const fetchTasks = async () => {
      if (!user?.id) return;

      try {
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("id, task, task_category, task_emoji, task_description");

        if (tasksError) throw tasksError;

        const { data: paperCounts, error: countsError } = await supabase
          .from("arxivPapersData")
          .select("task_ids");

        if (countsError) throw countsError;

        const paperCountMap = {};
        paperCounts.forEach((paper) => {
          paper.task_ids?.forEach((taskId) => {
            if (!paperCountMap[taskId]) paperCountMap[taskId] = 0;
            paperCountMap[taskId] += 1;
          });
        });

        const { data: followedTasks, error: followedError } = await supabase
          .from("followed_tasks")
          .select("task_id")
          .eq("user_id", user.id);

        if (followedError) throw followedError;

        const followedTaskIds = new Set(
          followedTasks?.map((ft) => ft.task_id) || []
        );

        const tasksWithDetails = tasksData.map((task) => ({
          ...task,
          paperCount: paperCountMap[task.id] || 0,
          isFollowed: followedTaskIds.has(task.id),
        }));

        const shuffled = [...tasksWithDetails].sort(() => Math.random() - 0.5);
        setTasks(shuffled);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [user?.id]);

  const handleTaskToggle = async (taskId) => {
    if (!user?.id) return;

    const task = tasks.find((t) => t.id === taskId);
    const newFollowStatus = !task.isFollowed;

    setTasks((currentTasks) =>
      currentTasks.map((t) =>
        t.id === taskId ? { ...t, isFollowed: newFollowStatus } : t
      )
    );

    try {
      if (newFollowStatus) {
        await supabase
          .from("followed_tasks")
          .insert([{ user_id: user.id, task_id: taskId }]);
      } else {
        await supabase
          .from("followed_tasks")
          .delete()
          .eq("user_id", user.id)
          .eq("task_id", taskId);
      }

      window.dispatchEvent(new CustomEvent("taskFollowUpdated"));
    } catch (error) {
      console.error("Error toggling topic:", error);
    }
  };

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

  const handleSearchBlur = () => {
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

  return (
    <DashboardLayout>
      <Container maxW="container.xl">
        <VStack spacing={4} align="stretch" mb={6}>
          <Heading as="h1" size="md">
            Your followed topics
          </Heading>
        </VStack>

        <Box mb={6}>
          <SelectedTopics tasks={tasks} onToggle={handleTaskToggle} />
        </Box>

        <Box position="relative" mb={8}>
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
                {suggestions.length == 0 && (
                  <ListItem
                    px={4}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: "blue.50" }}
                    display="flex"
                    alignItems="center"
                    gap={3}
                  >
                    <Box>
                      <Text fontWeight="normal">Sorry!</Text>
                      <Text fontSize="sm" color="gray.500">
                        No topics match your search
                      </Text>
                    </Box>
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </Box>

        <Box position="relative" mb={12}>
          {!isMobile && !searchTerm && currentPage > 0 && (
            <IconButton
              aria-label="Previous page"
              icon={<ChevronLeftIcon />}
              onClick={handlePrevPage}
              position="absolute"
              left="0"
              top="50%"
              transform="translateY(-50%)"
              colorScheme="gray"
              variant="ghost"
              size="lg"
              fontSize="24px"
            />
          )}

          <SimpleGrid columns={[1, 1, 2, 4]} spacing={6} px={12}>
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
              right="0"
              top="50%"
              transform="translateY(-50%)"
              colorScheme="gray"
              variant="ghost"
              size="lg"
              fontSize="24px"
            />
          )}
        </Box>

        <Box pt={4}>
          <FollowedTasksComponent />
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default FollowedTasksPage;
