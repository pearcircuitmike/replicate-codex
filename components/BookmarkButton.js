// components/BookmarkButton.js

import React, { useState, useEffect } from "react";
import {
  Button,
  Icon,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  Input,
  FormControl,
  FormLabel,
  Checkbox,
  VStack,
} from "@chakra-ui/react";
import { FaBookmark } from "react-icons/fa";
import supabase from "../pages/api/utils/supabaseClient"; // Adjust the path as needed
import { useAuth } from "../context/AuthContext"; // Adjust the path as needed
import LoginModal from "./LoginModal";
import { SketchPicker } from "react-color";

const BookmarkButton = ({
  resourceId,
  resourceType,
  onBookmarkChange,
  title,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("uncategorized");
  const [creatingNewFolder, setCreatingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#000000");
  const { user } = useAuth();
  const {
    isOpen: isBookmarkModalOpen,
    onOpen: onBookmarkModalOpen,
    onClose: onBookmarkModalClose,
  } = useDisclosure();
  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      fetchFolders();
      checkBookmarkStatus();
    } else {
      setIsLoading(false);
    }
  }, [user, resourceId, resourceType]);

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;

      setFolders(data || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Error fetching folders",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setFolders([]);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("bookmarked_resource", resourceId)
        .eq("resource_type", resourceType)
        .maybeSingle();

      if (error) throw error;

      setIsBookmarked(!!data);
    } catch (error) {
      console.error("Error checking bookmark status:", error);
      toast({
        title: "Error checking bookmark status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      onLoginOpen();
      return;
    }
    if (isBookmarked) {
      await removeBookmark();
    } else {
      onBookmarkModalOpen();
    }
  };

  const addBookmark = async (folderId) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("bookmarks").insert({
        user_id: user.id,
        bookmarked_resource: resourceId,
        resource_type: resourceType,
        folder_id: folderId,
        title: title,
      });

      if (error) throw error;

      setIsBookmarked(true);
      if (onBookmarkChange) onBookmarkChange(resourceId);
      toast({
        title: "Bookmark added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onBookmarkModalClose();
    } catch (error) {
      console.error("Error adding bookmark:", error);
      toast({
        title: "Error adding bookmark",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeBookmark = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("bookmarked_resource", resourceId)
        .eq("resource_type", resourceType);

      if (error) throw error;

      setIsBookmarked(false);
      if (onBookmarkChange) onBookmarkChange(resourceId);
      toast({
        title: "Bookmark removed",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast({
        title: "Error removing bookmark",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBookmark = async () => {
    try {
      let folderId = selectedFolderId;

      if (creatingNewFolder) {
        if (!newFolderName.trim()) {
          toast({
            title: "Folder name is required.",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        // Create new folder
        const { data: newFolder, error: folderError } = await supabase
          .from("folders")
          .insert({
            name: newFolderName.trim(),
            color: newFolderColor,
            user_id: user.id,
          })
          .select()
          .single();

        if (folderError) throw folderError;

        folderId = newFolder.id;
        // Refresh folders list
        setFolders([...folders, newFolder]);
      } else if (folderId === "uncategorized") {
        // Get or create 'Uncategorized' folder
        const { data: uncategorizedFolder, error: uncategorizedError } =
          await supabase
            .from("folders")
            .select("id")
            .eq("user_id", user.id)
            .eq("name", "Uncategorized")
            .single();

        if (uncategorizedError && uncategorizedError.code === "PGRST116") {
          // 'Uncategorized' folder does not exist; create it
          const { data: newUncategorizedFolder, error: createError } =
            await supabase
              .from("folders")
              .insert({
                name: "Uncategorized",
                color: "#A0AEC0", // Default gray color
                user_id: user.id,
              })
              .select()
              .single();

          if (createError) throw createError;

          folderId = newUncategorizedFolder.id;
          setFolders([...folders, newUncategorizedFolder]);
        } else if (uncategorizedError) {
          throw uncategorizedError;
        } else {
          folderId = uncategorizedFolder.id;
        }
      }

      await addBookmark(folderId);
    } catch (error) {
      console.error("Error saving bookmark:", error);
      toast({
        title: "Error saving bookmark",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Button
        onClick={toggleBookmark}
        isLoading={isLoading}
        leftIcon={
          <Icon
            as={FaBookmark}
            color={isBookmarked ? "yellow.500" : "gray.500"}
          />
        }
        variant="outline"
        w="100%"
        borderTopRadius="0"
        boxShadow="0"
      >
        {isBookmarked ? "Bookmarked" : "Add to bookmarks"}
      </Button>

      {/* Bookmark Modal */}
      <Modal
        isOpen={isBookmarkModalOpen}
        onClose={onBookmarkModalClose}
        isCentered
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Bookmark</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {!creatingNewFolder && (
                <FormControl>
                  <FormLabel>Select Folder</FormLabel>
                  <Select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                  >
                    <option value="uncategorized">Uncategorized</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Checkbox
                isChecked={creatingNewFolder}
                onChange={(e) => {
                  setCreatingNewFolder(e.target.checked);
                  if (e.target.checked) {
                    setSelectedFolderId(null);
                  } else {
                    setSelectedFolderId("uncategorized");
                  }
                }}
              >
                Create new folder
              </Checkbox>

              {creatingNewFolder && (
                <>
                  <FormControl>
                    <FormLabel>Folder Name</FormLabel>
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Enter folder name"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Folder Color</FormLabel>
                    <SketchPicker
                      color={newFolderColor}
                      onChangeComplete={(color) => setNewFolderColor(color.hex)}
                    />
                  </FormControl>
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSaveBookmark}>
              Save Bookmark
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
    </>
  );
};

export default BookmarkButton;
