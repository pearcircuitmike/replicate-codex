import React, { useState, useEffect } from "react";
import {
  VStack,
  Text,
  Box,
  Spinner,
  SimpleGrid,
  useToast,
  Container,
  Button,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import supabase from "@/pages/api/utils/supabaseClient";

const TopicCard = ({ task, isSelected, onToggle }) => (
  <Box
    onClick={() => onToggle(task.id)}
    cursor="pointer"
    borderWidth="1px"
    borderRadius="lg"
    overflow="hidden"
    w="full"
    h="32"
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    transition="all 0.2s"
    bg={isSelected ? "blue.50" : "white"}
    borderColor={isSelected ? "blue.500" : "gray.200"}
    _hover={{
      borderColor: "blue.500",
      transform: "scale(1.02)",
      shadow: "md",
    }}
  >
    <Text fontSize="3xl" mb={2}>
      {task.task_emoji || "📌"}
    </Text>
    <Text
      fontSize="sm"
      fontWeight="medium"
      textAlign="center"
      color={isSelected ? "blue.600" : "gray.700"}
      px={2}
    >
      {task.task}
    </Text>
  </Box>
);

const TopicSelectionPage = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.id) return;

      try {
        const [tasksResponse, followedResponse] = await Promise.all([
          supabase.from("tasks").select("id, task, task_category, task_emoji"),
          supabase
            .from("followed_tasks")
            .select("task_id")
            .eq("user_id", user.id),
        ]);

        if (tasksResponse.error) throw tasksResponse.error;
        if (followedResponse.error) throw followedResponse.error;

        const allTasks = tasksResponse.data;
        const followedTaskIds = new Set(
          followedResponse.data?.map((ft) => ft.task_id) || []
        );

        const tasksWithFollowStatus = allTasks.map((task) => ({
          ...task,
          isFollowed: followedTaskIds.has(task.id),
        }));

        setTasks(tasksWithFollowStatus);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({
          title: "Error fetching topics",
          description: "Unable to load topics. Please refresh the page.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchTasks();
    }
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
      const endpoint = newFollowStatus
        ? "/api/tasks/add-followed-task"
        : "/api/tasks/remove-followed-task";
      const method = newFollowStatus ? "POST" : "DELETE";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        setTasks((currentTasks) =>
          currentTasks.map((t) =>
            t.id === taskId ? { ...t, isFollowed: !newFollowStatus } : t
          )
        );
        throw new Error("Failed to update topic selection");
      }
    } catch (error) {
      console.error("Error toggling topic:", error);
      toast({
        title: "Error",
        description: "Failed to update selection. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleContinue = async () => {
    const selectedTasks = tasks.filter((task) => task.isFollowed);

    if (selectedTasks.length === 0) {
      toast({
        title: "Select topics",
        description: "Please select at least one topic to continue",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch("/api/onboarding/complete-topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to update onboarding status");
      }

      router.push("/onboarding/roles");
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      toast({
        title: "Error",
        description: "Failed to update onboarding status. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSkip = async () => {
    try {
      const response = await fetch("/api/onboarding/complete-topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to update onboarding status");
      }

      router.push("/onboarding/roles");
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      toast({
        title: "Error",
        description: "Failed to skip onboarding. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const groupTasksByCategory = (tasks) => {
    const grouped = {};
    tasks.forEach((task) => {
      if (!grouped[task.task_category]) {
        grouped[task.task_category] = [];
      }
      grouped[task.task_category].push(task);
    });
    return grouped;
  };

  if (!user?.id || isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner />
      </Box>
    );
  }

  const groupedTasks = groupTasksByCategory(tasks);
  const categories = Object.keys(groupedTasks);

  return (
    <Container maxW="4xl" py={12}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={4}>
            Choose topics to follow
          </Heading>
          <Text color="gray.600">
            Select the topics you're interested in to personalize your
            experience
          </Text>
        </Box>

        <Accordion defaultIndex={[0]} allowToggle>
          {categories.map((category) => (
            <AccordionItem key={category}>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text
                    fontSize="lg"
                    fontWeight="medium"
                    color="gray.700"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    {groupedTasks[category][0]?.task_emoji || "📌"} {category}
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <SimpleGrid columns={[2, 2, 3, 4]} spacing={4}>
                  {groupedTasks[category].map((task) => (
                    <TopicCard
                      key={task.id}
                      task={task}
                      isSelected={task.isFollowed}
                      onToggle={handleTaskToggle}
                    />
                  ))}
                </SimpleGrid>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>

        <Box display="flex" justifyContent="space-between" pt={6}>
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button colorScheme="blue" onClick={handleContinue}>
            Continue
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default TopicSelectionPage;
