// components/ChatInterface.js
import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Box,
  Input,
  Button,
  Flex,
  Text,
  VStack,
  HStack,
  Heading,
  Spinner,
  useToast,
  Link,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";

export default function ChatInterface({ sessionId: initialSessionId = null }) {
  const { user } = useAuth();
  const toast = useToast();
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({
    papers: [],
    models: [],
  });

  // Rate limit state
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState("");
  const [rateLimitResetTime, setRateLimitResetTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");

  // Add reference for message container
  const messagesContainerRef = useRef(null);

  // For tracking first message and title updates
  const hasCreatedNewSession = useRef(false);
  const firstUserMessage = useRef("");

  // Initialize chat with fixed settings
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: submitMessage,
    isLoading: isMessageLoading,
    setMessages,
    error: chatError,
  } = useChat({
    api: "/api/chat/stream",
    initialMessages: [],
    body: {
      userId: user?.id,
      sessionId,
      ragEnabled: true,
      model: "gpt-4o-mini",
    },
    onFinish: (message) => {
      console.log("Message finished, session:", sessionId);

      if (hasCreatedNewSession.current && firstUserMessage.current) {
        updateSessionTitle(firstUserMessage.current);
        hasCreatedNewSession.current = false;
        firstUserMessage.current = "";
      }

      fetchSessions();
      checkRateLimit(); // Check rate limit after message
    },
    onError: (error) => {
      console.error("Chat error:", error);

      // Check for rate limit errors from the SDK
      try {
        // The SDK might provide the error in different formats
        let errorData = null;

        // Try to parse JSON from error message if it's a string
        if (typeof error === "string" || typeof error.message === "string") {
          const errorText = typeof error === "string" ? error : error.message;
          const match = errorText.match(/\{.*\}/s);
          if (match) {
            try {
              errorData = JSON.parse(match[0]);
            } catch (e) {
              console.error("Error parsing JSON from error message:", e);
            }
          }
        }
        // If error or error.data is already an object, use it directly
        else if (error && typeof error === "object") {
          if (error.data && typeof error.data === "object") {
            errorData = error.data;
          } else {
            errorData = error;
          }
        }

        // If we found rate limit info, handle it
        if (errorData && errorData.error === "rate_limit_exceeded") {
          setIsRateLimited(true);
          setRateLimitMessage(errorData.message || "Rate limit exceeded");

          if (errorData.resetTime) {
            setRateLimitResetTime(new Date(errorData.resetTime));
          }

          toast({
            title: "Rate limit exceeded",
            description: errorData.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });

          return;
        }
      } catch (e) {
        console.error("Error handling rate limit error:", e);
      }

      // If it's not a rate limit error, show generic error
      toast({
        title: "Error sending message",
        description: "Something went wrong. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isMessageLoading]);

  // Update time remaining timer
  useEffect(() => {
    if (!rateLimitResetTime) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const diffMs = rateLimitResetTime - now;

      if (diffMs <= 0) {
        setIsRateLimited(false);
        setRateLimitResetTime(null);
        checkRateLimit(); // Check again after reset time
        return;
      }

      const diffSecs = Math.floor(diffMs / 1000);

      if (diffSecs < 60) {
        setTimeRemaining(`${diffSecs} second${diffSecs !== 1 ? "s" : ""}`);
      } else {
        const diffMins = Math.floor(diffSecs / 60);
        const remainingSecs = diffSecs % 60;
        setTimeRemaining(`${diffMins}m ${remainingSecs}s`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [rateLimitResetTime]);

  // Check rate limit periodically
  useEffect(() => {
    if (user?.id) {
      checkRateLimit();
      const interval = setInterval(checkRateLimit, 15000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Check if user is rate limited
  async function checkRateLimit() {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/chat/usage", {
        headers: {
          "x-user-id": user.id,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Update rate limit status
        if (!data.allowed) {
          setIsRateLimited(true);
          setRateLimitMessage(data.reason || "Rate limit exceeded");
          if (data.resetTime) {
            setRateLimitResetTime(new Date(data.resetTime));
          }
        } else {
          // Only clear if we're not in the middle of a timer countdown
          if (!rateLimitResetTime || new Date() >= rateLimitResetTime) {
            setIsRateLimited(false);
            setRateLimitResetTime(null);
          }
        }
      }
    } catch (error) {
      console.error("Error checking rate limit:", error);
    }
  }

  // Update session title using the API endpoint
  const updateSessionTitle = async (userMessage) => {
    if (!sessionId) return;

    const newTitle =
      userMessage.substring(0, 50) + (userMessage.length > 50 ? "..." : "");

    console.log(`Updating session ${sessionId} title to: ${newTitle}`);

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating session title:", errorData);
        toast({
          title: "Error updating chat title",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        console.log("Session title updated successfully");
        fetchSessions();
      }
    } catch (err) {
      console.error("Error in title update:", err);
      toast({
        title: "Error updating chat title",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fetch sessions on load
  useEffect(() => {
    if (user?.id) {
      fetchSessions();
      if (sessionId) {
        fetchSessionMessages(sessionId);
      }
    }
  }, [user?.id, sessionId]);

  // Fetch all user's sessions
  async function fetchSessions() {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat/sessions", {
        headers: {
          "x-user-id": user.id,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error fetching chat history",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch messages for a specific session
  async function fetchSessionMessages(sessId) {
    if (!user?.id || !sessId) return;
    setIsLoading(true);
    try {
      // Reset flags when loading an existing session
      hasCreatedNewSession.current = false;
      firstUserMessage.current = "";

      const response = await fetch(`/api/chat/sessions/${sessId}`, {
        headers: {
          "x-user-id": user.id,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(
            data.messages.map((msg) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
            }))
          );
          console.log(
            `Loaded ${data.messages.length} messages for session ${sessId}`
          );
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error loading conversation",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Create a new session
  async function createSession() {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          title: "New Chat",
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Created new session:", data.session.id);
        setSessionId(data.session.id);
        setMessages([]);
        hasCreatedNewSession.current = true;
        firstUserMessage.current = "";
        await fetchSessions();
      }
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error creating new chat",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Select an existing session
  function selectSession(sessId) {
    console.log("Selecting session:", sessId);
    setSessionId(sessId);
    fetchSessionMessages(sessId);
  }

  // Delete a session
  async function deleteSession(sessId, e) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;
    try {
      const response = await fetch(`/api/chat/sessions/${sessId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (response.ok) {
        toast({
          title: "Conversation deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        if (sessId === sessionId) {
          setSessionId(null);
          setMessages([]);
        }
        fetchSessions();
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error deleting conversation",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  // Handle chat submission
  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;

    // Store the user's message for title update
    if (messages.length === 0) {
      firstUserMessage.current = input;
    }

    // Check if rate limited before submitting
    if (isRateLimited) {
      toast({
        title: "Rate limit exceeded",
        description: rateLimitMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // If no session exists, create one
    if (!sessionId) {
      createSession().then(() => {
        // Set the message before submitting to ensure it's available for the title update
        submitMessage(e);
      });
      return;
    }

    // Submit the message
    submitMessage(e);
  }

  // Custom component to render markdown content
  const MarkdownContent = ({ content }) => {
    const processedContent = content.replace(/\\n/g, "\n");

    return (
      <Box className="markdown-content">
        <ReactMarkdown>{processedContent}</ReactMarkdown>
      </Box>
    );
  };

  return (
    <Flex h="100%" w="100%">
      {/* Sessions sidebar */}
      <Box
        w="250px"
        borderRight="1px solid"
        borderColor="gray.200"
        p={4}
        overflowY="auto"
        h="100%"
      >
        <VStack align="stretch" spacing={4}>
          <Button colorScheme="blue" onClick={createSession}>
            New Chat
          </Button>

          <Divider />
          <VStack align="stretch" spacing={2}>
            {isLoading && <Spinner size="sm" alignSelf="center" />}
            {sessions.map((session) => (
              <Box
                key={session.id}
                p={2}
                borderRadius="md"
                cursor="pointer"
                bg={session.id === sessionId ? "blue.50" : "transparent"}
                _hover={{ bg: "gray.100" }}
                onClick={() => selectSession(session.id)}
                position="relative"
              >
                <Text fontSize="sm" noOfLines={1}>
                  {session.title}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {new Date(session.updated_at).toLocaleDateString()}
                </Text>
                <Button
                  size="xs"
                  colorScheme="red"
                  variant="ghost"
                  position="absolute"
                  right={1}
                  top={1}
                  onClick={(e) => deleteSession(session.id, e)}
                >
                  ×
                </Button>
              </Box>
            ))}
          </VStack>
        </VStack>
      </Box>

      {/* Main chat area */}
      <Flex flex={1} direction="column" p={4} h="100%" overflow="hidden">
        {/* Header without controls */}
        <Flex justify="space-between" mb={4} align="center">
          <Heading size="md">AI Assistant</Heading>
        </Flex>

        {/* Rate limit error message */}
        {isRateLimited && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <Box>
              <AlertTitle>Rate Limit Exceeded</AlertTitle>
              <AlertDescription>
                {rateLimitMessage}
                {timeRemaining && (
                  <Text mt={1}>Try again in: {timeRemaining}</Text>
                )}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Messages area */}
        <VStack
          ref={messagesContainerRef}
          flex={1}
          spacing={4}
          align="stretch"
          overflowY="auto"
          mb={4}
          p={2}
          borderRadius="md"
          bg="gray.50"
          maxH="calc(100% - 80px)"
        >
          {messages.length === 0 && !isMessageLoading && (
            <Flex h="100%" justify="center" align="center" color="gray.500">
              <Text>Start a new conversation</Text>
            </Flex>
          )}
          {messages.map((message) => (
            <Box
              key={message.id}
              alignSelf={message.role === "user" ? "flex-end" : "flex-start"}
              bg={message.role === "user" ? "blue.100" : "white"}
              p={3}
              borderRadius="lg"
              maxW="80%"
              boxShadow="sm"
            >
              <Text fontWeight="bold" mb={1}>
                {message.role === "user" ? "You" : "AI Assistant"}
              </Text>
              {message.role === "user" ? (
                <Text whiteSpace="pre-wrap">{message.content}</Text>
              ) : (
                <MarkdownContent content={message.content} />
              )}
            </Box>
          ))}
          {isMessageLoading && (
            <Box
              alignSelf="flex-start"
              bg="white"
              p={3}
              borderRadius="lg"
              maxW="80%"
              boxShadow="sm"
            >
              <Text fontWeight="bold" mb={1}>
                AI Assistant
              </Text>
              <Flex align="center">
                <Spinner size="sm" mr={2} />
                <Text>Thinking...</Text>
              </Flex>
            </Box>
          )}
        </VStack>

        {/* Input area */}
        <Box position="sticky" bottom="0" bg="white" pt={2}>
          <form onSubmit={handleSubmit}>
            <Flex>
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about AI models, research papers, or techniques..."
                mr={2}
                disabled={isMessageLoading || isRateLimited}
              />
              <Button
                type="submit"
                colorScheme="blue"
                isDisabled={isMessageLoading || !input.trim() || isRateLimited}
                isLoading={isMessageLoading}
              >
                Send
              </Button>
            </Flex>
          </form>
        </Box>
      </Flex>
    </Flex>
  );
}
