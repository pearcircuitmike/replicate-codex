import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Text,
  Button,
  Divider,
  Icon,
  useToast,
  Spinner,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { AddIcon, ChatIcon, DeleteIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";

export default function ChatSidebar({
  activeSessionId,
  onSelectSession,
  onNewChat,
  sessions,
  setSessions,
}) {
  // If sessions are passed as props, use those, otherwise manage them locally
  const [localSessions, setLocalSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use the provided sessions if available, otherwise use local state
  const displaySessions = sessions || localSessions;
  const updateSessions = setSessions || setLocalSessions;
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  async function fetchSessions() {
    try {
      setLoading(true);
      const res = await fetch(`/api/chat/sessions?user_id=${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch sessions");

      const data = await res.json();
      updateSessions(data.sessions || []);
    } catch (error) {
      toast({
        title: "Error loading chat history",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleNewChat() {
    if (onNewChat) {
      onNewChat();
    }
  }

  function handleSelectSession(sessionId) {
    if (onSelectSession) {
      onSelectSession(sessionId);
    }
  }

  async function handleDeleteSession(sessionId, e) {
    e.stopPropagation();

    if (confirm("Are you sure you want to delete this chat?")) {
      try {
        const res = await fetch(`/api/chat/sessions/${sessionId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
          }),
        });

        if (!res.ok) throw new Error("Failed to delete chat");

        toast({
          title: "Chat deleted",
          status: "success",
          duration: 3000,
        });

        // Remove from state
        updateSessions(displaySessions.filter((s) => s.id !== sessionId));

        // If this was the active session, create a new chat
        if (sessionId === activeSessionId) {
          handleNewChat();
        }
      } catch (error) {
        toast({
          title: "Error deleting chat",
          description: error.message,
          status: "error",
          duration: 5000,
        });
      }
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  }

  return (
    <Box
      width={{ base: "full", md: "300px" }}
      height="full"
      borderRight="1px solid #e2e2e2"
      bg="gray.50"
      p={4}
      display="flex"
      flexDirection="column"
    >
      <Button
        leftIcon={<AddIcon />}
        colorScheme="blue"
        variant="solid"
        width="full"
        mb={4}
        onClick={handleNewChat}
      >
        New Chat
      </Button>

      <Divider mb={4} />

      <Text fontWeight="bold" mb={2}>
        Recent Chats
      </Text>

      {loading ? (
        <Box textAlign="center" py={8}>
          <Spinner />
        </Box>
      ) : displaySessions.length === 0 ? (
        <Box textAlign="center" py={8} color="gray.500">
          <Icon as={ChatIcon} w={10} h={10} mb={2} />
          <Text>No chat history yet</Text>
        </Box>
      ) : (
        <VStack
          align="stretch"
          spacing={1}
          flex="1"
          overflowY="auto"
          css={{
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "gray.200",
              borderRadius: "24px",
            },
          }}
        >
          {displaySessions.map((session) => (
            <Flex
              key={session.id}
              p={3}
              borderRadius="md"
              cursor="pointer"
              bg={activeSessionId === session.id ? "blue.50" : "transparent"}
              _hover={{
                bg: activeSessionId === session.id ? "blue.50" : "gray.100",
              }}
              onClick={() => handleSelectSession(session.id)}
              justifyContent="space-between"
              alignItems="center"
            >
              <Box flex={1}>
                <Text
                  noOfLines={1}
                  fontWeight={
                    activeSessionId === session.id ? "bold" : "normal"
                  }
                >
                  {session.title}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {formatDate(session.updated_at)}
                </Text>
              </Box>
              <IconButton
                icon={<DeleteIcon />}
                variant="ghost"
                size="sm"
                aria-label="Delete chat"
                onClick={(e) => handleDeleteSession(session.id, e)}
                opacity={0.6}
                _hover={{ opacity: 1 }}
              />
            </Flex>
          ))}
        </VStack>
      )}
    </Box>
  );
}
