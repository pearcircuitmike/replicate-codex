// components/dashboard/FolderSidebar.js

import React, { useState } from "react";
import {
  Flex,
  Box,
  Text,
  IconButton,
  Button,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from "next/router";
import FolderModal from "./FolderModal";
import { useAuth } from "../../context/AuthContext";
import supabase from "@/pages/api/utils/supabaseClient";

const FolderSidebar = ({
  folders,
  onFolderModalOpen,
  fetchFolders,
  updateFolderCount,
}) => {
  const router = useRouter();
  const [editingFolder, setEditingFolder] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { user } = useAuth();

  const handleFolderClick = (folderId) => {
    router.push(`/dashboard/library?folderId=${folderId}`);
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    onOpen();
  };

  const handleDeleteFolder = async (folderId) => {
    if (!user) return;

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const response = await fetch("/api/dashboard/delete-bookmark-folder", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ folderId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "An error occurred while deleting the folder"
        );
      }

      fetchFolders();
      toast({
        title: "Folder deleted",
        description: "All bookmarks have been moved to Uncategorized",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error deleting folder",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleModalClose = () => {
    setEditingFolder(null);
    onClose();
    fetchFolders();
  };

  if (!user) {
    return null; // or some loading state
  }

  return (
    <>
      {folders.map((folder) => (
        <Flex
          key={folder.id}
          align="center"
          px={4}
          py={1}
          cursor="pointer"
          _hover={{ bg: "gray.50" }}
          onClick={() => handleFolderClick(folder.id)}
          position="relative"
          role="group"
        >
          <Box
            width="10px"
            height="10px"
            borderRadius="50%"
            bg={folder.color || "gray.500"}
            mr={2}
          />
          <Text flex="1" fontSize="sm" color="gray.600" isTruncated>
            {folder.name}
          </Text>
          <Text fontSize="sm" color="gray.600" ml={2}>
            {folder.bookmarkCount}
          </Text>
          {folder.name !== "Uncategorized" && (
            <Flex
              position="absolute"
              right="10px"
              opacity={0}
              _groupHover={{ opacity: 1 }}
              transition="opacity 0.2s"
            >
              <IconButton
                icon={<FaEdit />}
                size="sm"
                variant="ghost"
                aria-label="Edit Folder"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditFolder(folder);
                }}
              />
              <IconButton
                icon={<FaTrash />}
                size="sm"
                variant="ghost"
                aria-label="Delete Folder"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder.id);
                }}
              />
            </Flex>
          )}
        </Flex>
      ))}
      <Button
        variant="ghost"
        justifyContent="flex-start"
        onClick={onFolderModalOpen}
        mt={4}
        mx={4}
      >
        New Folder +
      </Button>

      <FolderModal
        isOpen={isOpen}
        onClose={handleModalClose}
        fetchFolders={fetchFolders}
        editingFolder={editingFolder}
      />
    </>
  );
};

export default FolderSidebar;
