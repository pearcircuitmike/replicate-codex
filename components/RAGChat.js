import React, { useRef, useEffect, useState } from "react";
import { useChat } from "ai/react";
import {
  Box,
  Flex,
  VStack,
  Text,
  Textarea,
  Button,
  Image,
  useToast,
  Container,
  Link as ChakraLink,
  IconButton,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { trackEvent } from "@/pages/api/utils/analytics-util";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import ChatSidebar from "./ChatSidebar";
import { chatService } from "../services/chatService";

const customMarkdownTheme = ChakraUIRenderer({
  img: ({ src, alt }) => (
    <Image src={src} alt={alt} maxWidth="150px" borderRadius="md" my={4} />
  ),
  a: ({ href, children }) => (
    <ChakraLink
      href={href}
      color="blue.500"
      textDecoration="underline"
      isExternal
    >
      {children}
    </ChakraLink>
  ),
});

export default function RAGchat() {
  const toast = useToast();
  const { user, hasActiveSubscription } = useAuth();
  const router = useRouter();
  const messagesContainerRef = useRef(null);
  const submissionLockRef = useRef(false);

  // State
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [immediateLoading, setImmediateLoading] = useState(false);
  const [dots, setDots] = useState(".");
  const [usageCount, setUsageCount] = useState(0);
  const [usageChecked, setUsageChecked] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
  } = useChat({
    api: "/api/chat/rag",
    initialMessages: [],
    body: {
      userId: user?.id,
      sessionId: activeSessionId,
    },
    onResponse: async (response) => {
      // Check for session ID in headers (for new sessions)
      const sessionId = response.headers.get("X-Session-Id");
      if (sessionId && sessionId !== "none" && !activeSessionId) {
        setActiveSessionId(sessionId);

        // Fetch the session details and add to the sessions list
        if (user) {
          try {
            const { session } = await chatService.getSession(
              sessionId,
              user.id
            );
            setSessions((prev) => [session, ...prev]);
          } catch (error) {
            console.error("Error fetching new session details:", error);
          }
        }
      }
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    },
    onFinish: (finalAssistantMessage) => {
      if (user && finalAssistantMessage.role === "assistant") {
        trackEvent("ragchat", {
          userId: user.id,
          messages,
          sessionId: activeSessionId,
        });
        if (!hasActiveSubscription) {
          setUsageCount((prev) => prev + 1);
        }
      }
    },
  });

  // Fetch the usage count for free users
  useEffect(() => {
    if (!hasActiveSubscription && user) {
      chatService
        .getUsage(user.id)
        .then((data) => {
          setUsageCount(data.count || 0);
          setUsageChecked(true);
        })
        .catch((err) => {
          toast({
            title: "Error checking usage",
            description: err.message,
            status: "error",
            duration: 5000,
          });
          setUsageChecked(true);
        });
    } else {
      setUsageChecked(true);
    }
  }, [user, hasActiveSubscription, toast]);

  // Create a blinking ellipsis effect
  useEffect(() => {
    let intervalId;
    if (immediateLoading) {
      intervalId = setInterval(() => {
        setDots((prev) => (prev === "..." ? "." : prev + "."));
      }, 500);
    } else {
      setDots(".");
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [immediateLoading]);

  // Reset loading state when isLoading changes
  useEffect(() => {
    if (!isLoading) {
      submissionLockRef.current = false;
      setImmediateLoading(false);
    }
  }, [isLoading]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Load a specific chat session
  async function loadChatSession(sessionId) {
    if (!user || !sessionId) return;

    setIsLoadingSession(true);
    try {
      const { messages: sessionMessages } = await chatService.getSession(
        sessionId,
        user.id
      );

      // Format messages for the useChat hook
      const formattedMessages = sessionMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        id: msg.id,
      }));

      setMessages(formattedMessages);
      setActiveSessionId(sessionId);
    } catch (error) {
      toast({
        title: "Error loading chat",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoadingSession(false);
    }
  }

  // Create a new chat session
  function handleNewChat() {
    setActiveSessionId(null);
    setMessages([]);
  }

  // Send a message
  async function handleMessageSend(e) {
    e.preventDefault();

    if (isLoading || submissionLockRef.current) return;
    submissionLockRef.current = true;
    setImmediateLoading(true);

    if (!user) {
      toast({
        title: "Please log in to chat.",
        status: "info",
        duration: 3000,
      });
      submissionLockRef.current = false;
      setImmediateLoading(false);
      return;
    }

    // Free users have a limit of 15 messages
    if (!hasActiveSubscription && usageCount >= 15) {
      toast({
        title: "Free chat limit reached",
        description:
          "You have reached your limit for free chats. Upgrade to Premium to continue chatting.",
        status: "warning",
        duration: 5000,
      });
      submissionLockRef.current = false;
      setImmediateLoading(false);
      return;
    }

    const userQuery = input.trim();
    if (!userQuery) {
      submissionLockRef.current = false;
      setImmediateLoading(false);
      return;
    }

    try {
      const retrieved = await chatService.retrieveContext(userQuery);
      handleSubmit(e, {
        body: {
          userId: user.id,
          ragContext: retrieved,
          userQuery,
          sessionId: activeSessionId,
        },
      });
    } catch (err) {
      toast({
        title: "Error retrieving data",
        description: err.message,
        status: "error",
        duration: 5000,
      });
      submissionLockRef.current = false;
      setImmediateLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (isLoading && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleMessageSend(e);
    }
  }

  const effectiveLoading = immediateLoading || isLoading;
  const lastMessage = messages[messages.length - 1];
  const showPlaceholder =
    immediateLoading && (!lastMessage || lastMessage.role !== "assistant");
  const isEmptyChat = messages.length === 0 && !isLoadingSession;

  return (
    <Container maxW="container.8xl" p={0}>
      <Flex height={{ base: "80vh", md: "85vh" }}>
        {/* Chat History Sidebar - conditionally shown */}
        {showSidebar && (
          <Box
            display={{ base: showSidebar ? "block" : "none", md: "block" }}
            width={{ base: "full", md: "300px" }}
            position={{ base: "absolute", md: "relative" }}
            zIndex={{ base: 10, md: 1 }}
            height="full"
          >
            <ChatSidebar
              activeSessionId={activeSessionId}
              onSelectSession={loadChatSession}
              onNewChat={handleNewChat}
              sessions={sessions}
              setSessions={setSessions}
            />
          </Box>
        )}

        {/* Main Chat Area */}
        <Box
          display="flex"
          flexDirection="column"
          height="full"
          border="1px solid #ccc"
          borderRadius="md"
          flex="1"
          width={{ base: showSidebar ? "0" : "full", md: "auto" }}
          position="relative"
        >
          <Box
            py={2}
            px={4}
            borderBottom="1px solid #e2e2e2"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Text fontSize="xl" fontWeight="bold">
                Research Assistant
              </Text>
              <Text fontSize="sm" color="gray.600" mt={1}>
                Describe what you are working on and get models and papers that
                can help.
              </Text>
              {!hasActiveSubscription && usageChecked && (
                <Text fontSize="sm" color="red.600" mt={1}>
                  Free chats used: {usageCount} / 15
                </Text>
              )}
            </Box>

            {/* Hamburger menu for mobile */}
            <IconButton
              icon={showSidebar ? <CloseIcon /> : <HamburgerIcon />}
              variant="ghost"
              onClick={() => setShowSidebar(!showSidebar)}
              aria-label={showSidebar ? "Hide sidebar" : "Show sidebar"}
              display={{ base: "flex", md: "none" }}
            />
          </Box>

          {/* Messages area */}
          <Box
            ref={messagesContainerRef}
            flex="1"
            overflowY="auto"
            p={4}
            bg="gray.50"
          >
            {isLoadingSession ? (
              <Box textAlign="center" color="gray.500" mt={8}>
                <Text>Loading chat history...</Text>
              </Box>
            ) : isEmptyChat ? (
              <Box textAlign="center" color="gray.500" mt={8}>
                <Text mb={3}>Ask a question! Examples...</Text>
                <Text>
                  What are some good models to colorize a line drawing?
                </Text>
                <Text>
                  What is the latest research on ASR error correction?
                </Text>
                <Text>Can you explain the multi-armed bandit problem?</Text>
              </Box>
            ) : (
              <VStack align="stretch" spacing={4}>
                {messages.map((msg, i) => (
                  <Box key={i}>
                    <Text
                      fontWeight="bold"
                      mb={1}
                      color={
                        msg.role === "assistant" ? "blue.600" : "green.600"
                      }
                    >
                      {msg.role === "assistant" ? "🤖 Assistant" : "You"}
                    </Text>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={customMarkdownTheme}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </Box>
                ))}
                {showPlaceholder && (
                  <Box>
                    <Text fontWeight="bold" mb={1} color="gray.500">
                      🤖 Assistant
                    </Text>
                    <Text color="gray.500">Assistant is thinking{dots}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </Box>

          {/* Chat input area */}
          {!hasActiveSubscription && usageChecked && usageCount >= 15 ? (
            <Box
              textAlign="center"
              p={3}
              borderTop="1px solid #e2e2e2"
              bg="white"
            >
              <Text mb={3}>
                You have reached your free chat limit. Upgrade to Premium to
                continue chatting.
              </Text>
              <Button
                onClick={() => router.push("/pricing")}
                colorScheme="blue"
              >
                Upgrade to Premium
              </Button>
            </Box>
          ) : (
            <Box
              as="form"
              onSubmit={handleMessageSend}
              position="sticky"
              bottom="0"
              borderTop="1px solid #e2e2e2"
              bg="white"
              p={3}
            >
              <Textarea
                placeholder="Type your question here..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={effectiveLoading || isLoadingSession}
              />
              <Flex justify="flex-end" mt={2}>
                {effectiveLoading ? (
                  <Button onClick={stop} colorScheme="red">
                    ■ Stop
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isDisabled={isLoadingSession}
                  >
                    Send
                  </Button>
                )}
              </Flex>
            </Box>
          )}
        </Box>
      </Flex>
    </Container>
  );
}
