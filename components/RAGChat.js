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
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { trackEvent } from "@/pages/api/utils/analytics-util";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";

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
  const submissionLockRef = useRef(false);

  // Local state to immediately lock the Send button and trigger the placeholder.
  const [immediateLoading, setImmediateLoading] = useState(false);

  // State for blinking ellipsis.
  const [dots, setDots] = useState(".");

  // Usage state for free users.
  const [usageCount, setUsageCount] = useState(0);
  const [usageChecked, setUsageChecked] = useState(false);

  // Fetch the usage count for free users.
  useEffect(() => {
    if (!hasActiveSubscription && user) {
      fetch(`/api/chat/rag-usage?user_id=${user.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch usage");
          return res.json();
        })
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

  // Create a blinking ellipsis effect while immediateLoading is true.
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

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat({
      api: "/api/chat/rag",
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
          });
          if (!hasActiveSubscription) {
            setUsageCount((prev) => prev + 1);
          }
        }
      },
    });

  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // When isLoading turns off, clear our lock and immediate loading state.
  useEffect(() => {
    if (!isLoading) {
      submissionLockRef.current = false;
      setImmediateLoading(false);
    }
  }, [isLoading]);

  async function retrieveModelsAndPapers(query) {
    const [modelsRes, papersRes] = await Promise.all([
      fetch("/api/search/semantic-search-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      }),
      fetch("/api/search/semantic-search-papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      }),
    ]);

    if (!modelsRes.ok) throw new Error("Failed to retrieve models");
    if (!papersRes.ok) throw new Error("Failed to retrieve papers");

    const [modelsJson, papersJson] = await Promise.all([
      modelsRes.json(),
      papersRes.json(),
    ]);

    return {
      models: modelsJson.data || [],
      papers: papersJson.data || [],
    };
  }

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

    // Free users now have a limit of 15 messages.
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
      const retrieved = await retrieveModelsAndPapers(userQuery);
      handleSubmit(e, {
        body: {
          userId: user.id,
          ragContext: retrieved,
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

  // Combined loading flag.
  const effectiveLoading = immediateLoading || isLoading;

  // Show the placeholder if immediateLoading is true and the last message isn't from the assistant.
  const lastMessage = messages[messages.length - 1];
  const showPlaceholder =
    immediateLoading && (!lastMessage || lastMessage.role !== "assistant");

  const isEmptyChat = messages.length === 0;

  return (
    <Container maxW="container.8xl" p={0}>
      <Box
        display="flex"
        flexDirection="column"
        height={{ base: "80vh", md: "85vh" }}
        border="1px solid #ccc"
        borderRadius="md"
      >
        <Box py={2} px={4} borderBottom="1px solid #e2e2e2">
          <Text fontSize="xl" fontWeight="bold">
            Research Assistant
          </Text>
          <Text fontSize="sm" color="gray.600" mt={1}>
            Describe what you are working on and get models and papers that can
            help.
          </Text>
          {!hasActiveSubscription && usageChecked && (
            <Text fontSize="sm" color="red.600" mt={1}>
              Free chats used: {usageCount} / 15
            </Text>
          )}
        </Box>

        <Box
          ref={messagesContainerRef}
          flex="1"
          overflowY="auto"
          p={4}
          bg="gray.50"
        >
          {isEmptyChat ? (
            <Box textAlign="center" color="gray.500" mt={8}>
              <Text mb={3}>Ask a question! Examples...</Text>
              <Text>What are some good models to colorize a line drawing?</Text>
              <Text>What is the latest research on ASR error correction?</Text>
              <Text>Can you explain the multi-armed bandit problem?</Text>
            </Box>
          ) : (
            <VStack align="stretch" spacing={4}>
              {messages.map((msg, i) => (
                <Box key={i}>
                  <Text
                    fontWeight="bold"
                    mb={1}
                    color={msg.role === "assistant" ? "blue.600" : "green.600"}
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
            <Button onClick={() => router.push("/pricing")} colorScheme="blue">
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
              disabled={effectiveLoading}
            />
            <Flex justify="flex-end" mt={2}>
              {effectiveLoading ? (
                <Button onClick={stop} colorScheme="red">
                  ■ Stop
                </Button>
              ) : (
                <Button type="submit" colorScheme="blue">
                  Send
                </Button>
              )}
            </Flex>
          </Box>
        )}
      </Box>
    </Container>
  );
}
