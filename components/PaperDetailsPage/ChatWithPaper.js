import React, { useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import {
  Box,
  Button,
  Flex,
  VStack,
  Text,
  useToast,
  IconButton,
  Collapse,
  Textarea,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon, ArrowUpIcon } from "@chakra-ui/icons";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/pages/api/utils/analytics-util";

const ChatWithPaper = ({ paperId, paper }) => {
  const { user, hasActiveSubscription } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [rightOffset, setRightOffset] = useState(0);
  const columnRef = useRef(null);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const updateOffset = () => {
      if (columnRef.current) {
        const rect = columnRef.current.getBoundingClientRect();
        setRightOffset(window.innerWidth - rect.right - 15);
      }
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, []);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    trackEvent("paper_chat_message", {
      paper_id: paperId,
      message: messages,
      is_subscribed: hasActiveSubscription,
    });

    handleSubmit(e);
  };

  return (
    <>
      <Box ref={columnRef} position="absolute" right={0} width="100%" />
      <Box
        position="fixed"
        bottom={5}
        right={`${rightOffset}px`}
        width={columnRef.current?.getBoundingClientRect().width || "auto"}
        bg="white"
        boxShadow="lg"
        borderTopRadius="lg"
        zIndex={999}
      >
        <Flex
          p={2}
          align="center"
          justify="space-between"
          bg="blue.800"
          color="white"
          borderTopRadius="lg"
          cursor="pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Text fontSize="sm" fontWeight="medium" ml={2}>
            Chat with Paper
          </Text>
          <IconButton
            icon={isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
            color="white"
            _hover={{ bg: "blue.600" }}
          />
        </Flex>

        <Collapse in={isExpanded}>
          <VStack
            maxH="300px"
            overflowY="auto"
            p={4}
            spacing={4}
            align="stretch"
            bg="gray.50"
          >
            {messages.map((message, i) => (
              <Box
                key={i}
                alignSelf={message.role === "user" ? "flex-end" : "flex-start"}
                bg={message.role === "user" ? "blue.500" : "white"}
                color={message.role === "user" ? "white" : "black"}
                px={4}
                py={2}
                borderRadius="lg"
                maxW="100%"
                boxShadow="sm"
              >
                <Text fontSize="sm">{message.content}</Text>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </VStack>
        </Collapse>

        <Box p={3} borderTop="1px" borderColor="gray.200">
          <form onSubmit={handleMessageSubmit}>
            <Flex direction="column" gap={2}>
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Ask a question about this paper"
                disabled={isLoading}
                minH="60px"
                maxH="120px"
                rows={1}
                resize="none"
                borderRadius="lg"
                fontSize="sm"
                py={2}
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "none",
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleMessageSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                isLoading={isLoading}
                colorScheme="blue"
                size="md"
                rightIcon={<ArrowUpIcon />}
                alignSelf="flex-end"
              >
                Chat
              </Button>
            </Flex>
          </form>
        </Box>
      </Box>
    </>
  );
};

export default ChatWithPaper;
