import React from "react";
import { Box, VStack, Text, Avatar, Flex, IconButton } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

const HighlightSidebar = ({
  highlights,
  onHighlightClick,
  onHighlightRemove,
  selectedHighlightId,
}) => {
  const { user } = useAuth();

  // Sort by stored text_position
  const sortedHighlights = [...(highlights || [])].sort(
    (a, b) => a.text_position - b.text_position
  );

  const handleHighlightClick = (highlight) => {
    // First call the passed in click handler
    onHighlightClick?.(highlight);

    // Then find and scroll to the highlight
    const marks = document.querySelectorAll('mark[data-highlight="true"]');
    for (const mark of marks) {
      if (mark.textContent === highlight.quote) {
        mark.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      }
    }
  };

  return (
    <Box
      p={2}
      borderLeft="1px solid"
      borderColor="gray.200"
      height="100%"
      overflowY="auto"
    >
      <Text fontSize="lg" fontWeight="bold" mb={2}>
        Highlights & Comments
      </Text>
      <VStack spacing={2} align="stretch">
        {sortedHighlights.map((highlight) => (
          <Box
            key={highlight.id}
            p={2}
            bg={selectedHighlightId === highlight.id ? "blue.50" : "gray.50"}
            borderRadius="md"
            borderLeft="4px solid"
            borderLeftColor={highlight.is_comment ? "green.400" : "blue.400"}
            transition="all 0.2s"
            cursor="pointer"
            onClick={() => handleHighlightClick(highlight)}
            _hover={{ bg: "gray.100" }}
          >
            <Flex justify="space-between" align="center" mb={1}>
              <Flex align="center" gap={2}>
                <Avatar
                  size="xs"
                  src={highlight.user_profile?.avatar_url}
                  name={
                    highlight.user_profile?.full_name ||
                    highlight.user_profile?.username ||
                    "Anonymous"
                  }
                />
                <Text fontSize="sm" color="gray.600">
                  {highlight.user_profile?.full_name ||
                    highlight.user_profile?.username ||
                    "Anonymous"}
                </Text>
              </Flex>
              {user && user.id === highlight.user_id && onHighlightRemove && (
                <IconButton
                  size="xs"
                  icon={<CloseIcon />}
                  variant="ghost"
                  aria-label="Remove highlight"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHighlightRemove(highlight.id);
                  }}
                />
              )}
            </Flex>
            <Text fontSize="sm" fontStyle="italic" mb={1} color="gray.700">
              "{highlight.quote}"
            </Text>
            <Text fontSize="xs" color="gray.500">
              {format(
                new Date(highlight.created_at),
                "MMM d, yyyy 'at' h:mm a"
              )}
            </Text>
            {highlight.is_comment && (
              <Text fontSize="xs" color="green.600" fontWeight="medium" mt={1}>
                Comment
              </Text>
            )}
          </Box>
        ))}
        {sortedHighlights.length === 0 && (
          <Text color="gray.500" fontSize="sm" textAlign="center" py={2}>
            No highlights or comments yet
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default HighlightSidebar;
