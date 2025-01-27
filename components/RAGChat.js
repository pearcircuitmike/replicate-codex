import React, { useRef, useEffect } from "react";
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
  const { user } = useAuth();

  // Pull in only isLoading from the useChat hook
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

  function handleMessageSend(e) {
    e.preventDefault();

    // If the chat is currently generating, do nothing
    if (isLoading) return;

    if (!user) {
      toast({
        title: "Please log in to chat.",
        status: "info",
        duration: 3000,
      });
      return;
    }

    const userQuery = input.trim();
    if (!userQuery) {
      return;
    }

    retrieveModelsAndPapers(userQuery)
      .then((retrieved) => {
        handleSubmit(e, {
          body: {
            userId: user.id,
            ragContext: retrieved,
          },
        });
      })
      .catch((err) => {
        toast({
          title: "Error retrieving data",
          description: err.message,
          status: "error",
          duration: 5000,
        });
      });
  }

  function handleKeyDown(e) {
    // If loading, ignore Enter
    if (isLoading && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      return;
    }

    // If not loading, let Enter submit
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleMessageSend(e);
    }
  }

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
            </VStack>
          )}
        </Box>

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
          />
          <Flex justify="flex-end" mt={2}>
            {isLoading ? (
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
      </Box>
    </Container>
  );
}
