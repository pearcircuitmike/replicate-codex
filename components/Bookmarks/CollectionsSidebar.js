// /components/Bookmarks/CollectionsSidebar.js
import {
  Box,
  Button,
  Heading,
  HStack,
  Text,
  VStack,
  IconButton,
} from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import supabase from "@/pages/api/utils/supabaseClient";

const CollectionsSidebar = ({
  folders,
  selectedFolderId,
  onFolderSelect,
  onNewCollection,
  onFoldersRefresh,
}) => {
  const [hoveredFolder, setHoveredFolder] = useState(null);

  const handleDeleteFolder = async (folderId, folderName) => {
    // Don't allow deletion of Uncategorized folder
    if (folderName === "Uncategorized") return;

    try {
      const session = await supabase.auth.getSession();
      const response = await fetch("/api/dashboard/delete-bookmark-folder", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          folderId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete folder");
      }

      // Refresh folders list after successful deletion
      onFoldersRefresh?.();
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  return (
    <Box position="sticky" top="4">
      <HStack justify="space-between" mb={4}>
        <Heading size="md">Collections</Heading>
        <Button
          colorScheme="green"
          size="sm"
          variant="ghost"
          onClick={onNewCollection}
        >
          + New Collection
        </Button>
      </HStack>
      <VStack align="stretch" spacing={2}>
        {folders.map((folder) => (
          <Box
            key={folder.id}
            position="relative"
            onMouseEnter={() => setHoveredFolder(folder.id)}
            onMouseLeave={() => setHoveredFolder(null)}
          >
            <Button
              variant={selectedFolderId === folder.id ? "solid" : "ghost"}
              justifyContent="space-between"
              size="sm"
              onClick={() => onFolderSelect(folder)}
              width="full"
              py={4}
              pr={
                hoveredFolder === folder.id && folder.name !== "Uncategorized"
                  ? 12
                  : 4
              }
              transition="padding 0.2s"
            >
              <Text>{folder.name}</Text>
              <Text color="gray.500">({folder.bookmarkCount})</Text>
            </Button>
            {hoveredFolder === folder.id && folder.name !== "Uncategorized" && (
              <IconButton
                icon={<FaTrash />}
                variant="ghost"
                size="sm"
                position="absolute"
                right={0}
                top="50%"
                transform="translateY(-50%)"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder.id, folder.name);
                }}
                aria-label="Delete folder"
                color="red.500"
                _hover={{ bg: "transparent", color: "red.600" }}
                animation="slideIn 0.2s ease-out"
              />
            )}
          </Box>
        ))}
      </VStack>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(100%, -50%);
          }
          to {
            opacity: 1;
            transform: translate(0, -50%);
          }
        }
      `}</style>
    </Box>
  );
};

export default CollectionsSidebar;
