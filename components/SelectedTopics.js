import React from "react";
import {
  Box,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  Text,
} from "@chakra-ui/react";

export const SelectedTopics = ({ tasks = [], onToggle }) => {
  const selectedTasks = tasks.filter((t) => t.isFollowed);

  return (
    <>
      {selectedTasks.length === 0 ? (
        <Box
          borderWidth="1px"
          borderStyle="dashed"
          borderColor="gray.200"
          borderRadius="lg"
          py={6}
          bg="gray.50"
        >
          <Flex
            wrap="wrap"
            justify={selectedTasks.length === 0 ? "center" : "start"}
          >
            <Tag
              size="lg"
              bg="none"
              color="gray.500"
              mr={5}
              mb={2}
              justifyContent="center"
            >
              <TagLabel>
                Select topics below to get personalized updates
              </TagLabel>
            </Tag>
          </Flex>
        </Box>
      ) : (
        <Box borderWidth="1px" borderColor="white" py={6} px={1}>
          <Flex wrap="wrap" justify="start">
            {selectedTasks.map((task) => (
              <Tag
                key={task.id}
                size="lg"
                borderRadius="full"
                colorScheme="blue"
                mr={5}
                mb={2}
              >
                <TagLabel>{task.task}</TagLabel>
                <TagCloseButton onClick={() => onToggle(task.id)} />
              </Tag>
            ))}
          </Flex>
        </Box>
      )}
    </>
  );
};
