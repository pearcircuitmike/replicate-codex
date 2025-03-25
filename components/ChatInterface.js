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
  Heading,
  Spinner,
  useToast,
  Link,
  Divider,
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
  } = useChat({
    api: "/api/chat/stream",
    initialMessages: [],
    body: {
      userId: user?.id,
      sessionId,
      ragEnabled: true, // Always enabled
      model: "gpt-4o-mini", // Fixed model
    },
    onFinish: (message) => {
      console.log("Message finished, session:", sessionId);

      // Only update title after first message exchange in a new session
      if (hasCreatedNewSession.current && firstUserMessage.current) {
        updateSessionTitle(firstUserMessage.current);
        hasCreatedNewSession.current = false;
        firstUserMessage.current = "";
      }

      fetchSessions();
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

  // Update session title using the API endpoint instead of direct DB access
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
          title: "New Chat", // Initial placeholder title
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Created new session:", data.session.id);
        setSessionId(data.session.id);
        setMessages([]);

        // Set flag to indicate we've created a new session
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

    // If no session exists, create one
    if (!sessionId) {
      createSession().then(() => {
        // CRITICAL: Directly update the title after getting sessionId
        updateSessionTitle(input);
        submitMessage(e);
      });
      return;
    }

    // If this is first message of a new session, update title directly
    if (messages.length === 0) {
      updateSessionTitle(input);
    }

    // Submit the message
    submitMessage(e);
  }

  // Custom component to render markdown content with proper styles
  const MarkdownContent = ({ content }) => {
    // Replace escaped newlines with actual newlines before rendering
    const processedContent = content.replace(/\\n/g, "\n");

    return (
      <Box className="markdown-content">
        <ReactMarkdown
          components={{
            p: (props) => <Text mb={4} {...props} />,
            h1: (props) => (
              <Heading as="h1" size="xl" mt={6} mb={4} {...props} />
            ),
            h2: (props) => (
              <Heading as="h2" size="lg" mt={5} mb={3} {...props} />
            ),
            h3: (props) => (
              <Heading as="h3" size="md" mt={4} mb={2} {...props} />
            ),
            ul: (props) => <Box as="ul" pl={5} mb={4} {...props} />,
            ol: (props) => <Box as="ol" pl={5} mb={4} {...props} />,
            li: (props) => <Box as="li" ml={2} mb={1} {...props} />,
            a: (props) => <Link color="blue.500" isExternal {...props} />,
            blockquote: (props) => (
              <Box
                as="blockquote"
                borderLeftWidth="4px"
                borderLeftColor="gray.200"
                pl={4}
                py={2}
                my={4}
                color="gray.700"
                {...props}
              />
            ),
            code: (props) => {
              const { children, inline } = props;
              return inline ? (
                <Box
                  as="code"
                  bg="gray.100"
                  p={1}
                  borderRadius="sm"
                  fontSize="sm"
                  fontFamily="monospace"
                  {...props}
                />
              ) : (
                <Box
                  as="pre"
                  bg="gray.100"
                  p={3}
                  borderRadius="md"
                  overflowX="auto"
                  fontSize="sm"
                  fontFamily="monospace"
                  my={4}
                  {...props}
                />
              );
            },
          }}
        >
          {processedContent}
        </ReactMarkdown>
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
                disabled={isMessageLoading}
              />
              <Button
                type="submit"
                colorScheme="blue"
                isDisabled={isMessageLoading || !input.trim()}
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
