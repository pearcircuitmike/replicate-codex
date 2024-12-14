// /components/Bookmarks/BookmarkItem.js
import { Box, IconButton, HStack, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FaTrash } from "react-icons/fa";
import supabase from "@/pages/api/utils/supabaseClient";

const BookmarkItem = ({
  bookmark,
  onRemove,
  type = "paper", // 'paper' or 'model'
}) => {
  const router = useRouter();
  const resource = bookmark.resourceData;
  const title = type === "paper" ? resource.title : resource.modelName;
  const description =
    type === "paper" ? resource.abstract : resource.description;

  const getResourceUrl = () => {
    if (type === "paper") {
      return `/papers/${resource.platform || "arxiv"}/${resource.slug}`;
    } else {
      return `/models/${resource.platform}/${resource.slug}`;
    }
  };

  const handleRemove = async () => {
    try {
      const session = await supabase.auth.getSession();

      if (!session?.data?.session) {
        throw new Error("No active session");
      }

      const response = await fetch("/api/dashboard/remove-bookmark", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          resourceId: resource.id,
          resourceType: type,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove bookmark");
      }

      const data = await response.json();
      onRemove(bookmark.id, type, data.folderId);
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  return (
    <Box pb={6} borderBottom="1px" borderColor="gray.200">
      <HStack justify="space-between" mb={2}>
        <Text fontSize="sm" color="gray.500">
          Bookmarked {new Date(bookmark.created_at).toLocaleDateString()}
        </Text>
        <IconButton
          size="sm"
          variant="ghost"
          icon={<FaTrash />}
          aria-label="Remove bookmark"
          onClick={handleRemove}
        />
      </HStack>

      <Heading size="md" mb={2} lineHeight="1.4">
        <Box
          as="a"
          onClick={(e) => {
            e.preventDefault();
            router.push(getResourceUrl());
          }}
          href={getResourceUrl()}
          color="gray.900"
          _hover={{ color: "blue.600", cursor: "pointer" }}
        >
          {title}
        </Box>
      </Heading>

      {description && (
        <Text color="gray.600" noOfLines={3}>
          {description}
        </Text>
      )}
    </Box>
  );
};

export default BookmarkItem;
