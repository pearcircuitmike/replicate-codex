import React, { useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  Text,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Input,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from "next/router";
import supabase from "@/pages/api/utils/supabaseClient";
import { SketchPicker } from "react-color";

const FolderSidebar = ({
  folders,
  setFolders,
  onFolderModalOpen,
  fetchFolders,
}) => {
  const router = useRouter();
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("#000000");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleFolderClick = (folderId) => {
    router.push(`/dashboard/library?folderId=${folderId}`);
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderColor(folder.color || "#000000");
    onOpen();
  };

  const handleSaveChanges = async () => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .update({ name: folderName.trim(), color: folderColor })
        .eq("id", editingFolder.id)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        fetchFolders();
        onClose();
        toast({
          title: "Folder updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("No data returned");
      }
    } catch (error) {
      console.error("Error updating folder:", error);
      toast({
        title: "Error updating folder",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch("/api/dashboard/delete-bookmark-folder", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data.session.access_token}`,
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

      {/* Edit Folder Modal */}
      {editingFolder && (
        <Popover isOpen={isOpen} onClose={onClose}>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>
              <FormControl>
                <FormLabel>Folder Name</FormLabel>
                <Input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Folder Color</FormLabel>
                <SketchPicker
                  color={folderColor}
                  onChangeComplete={(color) => setFolderColor(color.hex)}
                />
              </FormControl>
            </PopoverBody>
            <PopoverFooter>
              <Button colorScheme="blue" onClick={handleSaveChanges}>
                Save
              </Button>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};

export default FolderSidebar;
