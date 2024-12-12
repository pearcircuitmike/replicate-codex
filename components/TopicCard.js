import React from "react";
import { Box, Text, Flex } from "@chakra-ui/react";

export const TopicCard = ({ task, isSelected, onToggle }) => (
  <Box
    onClick={() => onToggle(task.id)}
    cursor="pointer"
    borderWidth="2px"
    borderRadius="xl"
    overflow="hidden"
    w="full"
    display="flex"
    flexDirection="column"
    transition="all 0.2s"
    bg={isSelected ? "blue.50" : "white"}
    borderColor={isSelected ? "blue.500" : "gray.200"}
    _hover={{
      borderColor: "blue.500",
      transform: "translateY(-2px)",
      shadow: "md",
    }}
    p={3} // Reduced padding
  >
    <Flex justify="space-between" align="center">
      <Flex align="center" gap={2}>
        <Text fontSize="2xl">{task.task_emoji || "📌"}</Text>
        <Box>
          <Text fontWeight="semibold" fontSize="md">
            {task.task}
          </Text>
          {/* <Text fontSize="sm" color="gray.500">
            {task.paperCount} papers published today
          </Text>*/}
        </Box>
      </Flex>
    </Flex>
    <Text mt={2} fontSize="sm" color="gray.600">
      {task.task_description ||
        `Explore key developments in ${task.task.toLowerCase()}.`}
    </Text>
  </Box>
);
