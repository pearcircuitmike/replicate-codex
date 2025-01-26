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

import { trackEvent } from "@/pages/api/utils/analytics-util";
import { useAuth } from "../context/AuthContext";

const customMarkdownTheme = ChakraUIRenderer({
  img: ({ src, alt }) => (
    <Image src={src} alt={alt} maxWidth="150px" borderRadius="md" my={4} />
  ),
});

export default function RAGchat() {
  const toast = useToast();
  const { user } = useAuth();

  // We only call handleSubmit. We never manually push to messages.
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
      // Only called once the assistant has fully streamed its reply:
      onFinish: (finalAssistantMessage) => {
        if (user && finalAssistantMessage.role === "assistant") {
          trackEvent("ragchat", {
            userId: user.id,
            // messages now contains the final assistant response
            messages,
          });
        }
      },
    });

  const messagesContainerRef = useRef(null);

  // Keep the view scrolled to the bottom
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

    // Don’t manually insert the new user message into `messages` here.
    // Just call handleSubmit() with any extra data your API needs:
    handleSubmit(e, {
      body: {
        userId: user.id,
        // If you need to retrieve models, do so here and pass them along:
        // ragContext: retrievedModels,
      },
    });
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
            Describe what you are working on and get models and papers that can
            help.
          </Text>
        </Box>

        {/* Messages list */}
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
                    mb={1}
                    color={msg.role === "assistant" ? "blue.600" : "green.600"}
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

        {/* Input form */}
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
