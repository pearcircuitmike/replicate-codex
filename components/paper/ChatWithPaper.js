// components/paper/ChatWithPaper.js
import React, { useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import {
  Box,
  Input,
  Button,
  Flex,
  VStack,
  Text,
  useToast,
  IconButton,
  Collapse,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { useAuth } from "@/context/AuthContext";

const ChatWithPaper = ({ paperId, paper }) => {
  const { user, hasActiveSubscription } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat/paper",
      body: {
        paperContext: {
          abstract: paper.abstract,
          generatedSummary: paper.generatedSummary,
        },
        userId: user?.id,
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to send message",
          status: "error",
          duration: 5000,
        });
      },
    });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Expand chat when first message is sent
  useEffect(() => {
    if (messages.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  }, [messages.length]);

  const handleMessageSubmit = (e) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to chat with papers.",
        status: "warning",
        duration: 5000,
      });
      return;
    }

    if (!hasActiveSubscription) {
      toast({
        title: "Subscription Required",
        description: "Please upgrade your account to chat with papers.",
        status: "warning",
        duration: 5000,
      });
      return;
    }

    handleSubmit(e);
  };

  return (
    <Box
      position="fixed"
      bottom={0}
      left="50%"
      transform="translateX(-50%)"
      width={{ base: "100%", md: "700px" }}
      maxW="90%"
      bg="white"
      borderTopRadius="lg"
      boxShadow="lg"
      zIndex={10}
      transition="height 0.2s"
      height={isExpanded ? "60vh" : "auto"}
    >
      <Flex
        borderBottom="1px"
        borderColor="gray.200"
        p={2}
        align="center"
        justify="space-between"
      >
        <Text fontSize="sm" fontWeight="medium" ml={2}>
          Chat with Paper
        </Text>
        <IconButton
          icon={isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
        />
      </Flex>

      <Collapse in={isExpanded} animateOpacity>
        <VStack
          height="calc(60vh - 120px)"
          overflowY="auto"
          p={4}
          spacing={4}
          align="stretch"
          sx={{
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
          {messages.map((message, i) => (
            <Box
              key={i}
              alignSelf={message.role === "user" ? "flex-end" : "flex-start"}
              bg={message.role === "user" ? "blue.500" : "gray.100"}
              color={message.role === "user" ? "white" : "black"}
              px={4}
              py={2}
              borderRadius="lg"
              maxW="80%"
            >
              <Text whiteSpace="pre-wrap">{message.content}</Text>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </VStack>
      </Collapse>

      <form onSubmit={handleMessageSubmit}>
        <Flex p={3} gap={3} borderTop="1px" borderColor="gray.200">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question about this paper..."
            disabled={isLoading}
            bg="gray.50"
          />
          <Button type="submit" isLoading={isLoading} colorScheme="blue">
            Send
          </Button>
        </Flex>
      </form>
    </Box>
  );
};

export default ChatWithPaper;
