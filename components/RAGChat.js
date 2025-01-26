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
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";

import { useAuth } from "../context/AuthContext";

const customMarkdownTheme = ChakraUIRenderer({
  img: ({ src, alt }) => (
    <Image src={src} alt={alt} maxWidth="150px" borderRadius="md" my={4} />
  ),
});

export default function RAGchat() {
  const toast = useToast();
  const { user } = useAuth();

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
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
    });

  // This ref will be used for the scrollable container
  const messagesContainerRef = useRef(null);

  // Scroll to bottom whenever messages change,
  // but only inside the messages container, NOT the entire page.
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  async function retrieveModels(query) {
    const res = await fetch("/api/search/semantic-search-models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error("Failed to retrieve models");
    return (await res.json())?.data || [];
  }

  async function handleMessageSend(e) {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Please log in to chat.",
        status: "info",
        duration: 3000,
      });
      return;
    }
    const userQuery = input.trim();
    if (!userQuery) return;

    try {
      const retrieved = await retrieveModels(userQuery);
      handleSubmit(e, {
        body: {
          userId: user.id,
          ragContext: retrieved,
        },
      });
    } catch (err) {
      toast({
        title: "Error retrieving models",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleMessageSend(e);
    }
  }

  const isEmptyChat = messages.length === 0;

  return (
    <Container maxW="container.md" p={0}>
      {/* Give the chat container a fixed height so only it scrolls, not the entire page */}
      <Box
        display="flex"
        flexDirection="column"
        height="80vh"
        border="1px solid #ccc"
        borderRadius="md"
      >
        {/* Header */}
        <Box p={4} borderBottom="1px solid #e2e2e2">
          <Text fontSize="2xl" fontWeight="bold">
            Discover Chat
          </Text>
          <Text fontSize="md" color="gray.600" mt={1}>
            Describe a what you are working on and get models and papers that
            can help you.
          </Text>
        </Box>

        {/* Scrollable messages section (use the ref here) */}
        <Box
          ref={messagesContainerRef}
          flex="1"
          overflowY="auto"
          p={4}
          bg="gray.50"
        >
          {isEmptyChat ? (
            <Box textAlign="center" color="gray.500" mt={8}>
              <Text>No conversation yet.</Text>
            </Box>
          ) : (
            <VStack align="stretch" spacing={4}>
              {messages.map((msg, i) => (
                <Box key={i}>
                  <Text
                    fontWeight="bold"
                    color={msg.role === "assistant" ? "blue.600" : "green.600"}
                    mb={1}
                  >
                    {msg.role === "assistant" ? "AI" : "You"}
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

        {/* Sticky input bar at the bottom */}
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
            <Button type="submit" isLoading={isLoading} colorScheme="blue">
              Send
            </Button>
          </Flex>
        </Box>
      </Box>
    </Container>
  );
}
