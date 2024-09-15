// components/dashboard/BookmarkModal.js

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Select,
  Input,
  FormControl,
  FormLabel,
  Checkbox,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { SketchPicker } from "react-color";
import { useAuth } from "@/context/AuthContext";
import supabase from "@/pages/api/utils/supabaseClient";

const BookmarkModal = ({
  isOpen,
  onClose,
  itemToBookmark,
  onBookmarkAdded,
  fetchFolders, // Accept fetchFolders as a prop
}) => {
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [creatingNewFolder, setCreatingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#000000");
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      fetchFoldersInternal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const fetchFoldersInternal = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch("/api/dashboard/get-folders", {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch folders");
      const data = await response.json();
      const fetchedFolders = data.folders;

      setFolders(fetchedFolders);
      setSelectedFolderId(fetchedFolders[0]?.id || "");
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Error fetching folders",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSave = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
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
        const folderResponse = await fetch(
          "/api/dashboard/create-bookmark-folder",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
            body: JSON.stringify({
              name: newFolderName.trim(),
              color: newFolderColor,
            }),
          }
        );

        if (!folderResponse.ok) throw new Error("Failed to create new folder");
        const newFolder = await folderResponse.json();
        folderId = newFolder.folder.id;

        // Optionally, add the new folder to local state
        setFolders((prevFolders) => [...prevFolders, newFolder.folder]);
      }

      // Add bookmark to the selected folder
      const bookmarkResponse = await fetch("/api/dashboard/add-bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          resourceId: itemToBookmark.resource_id,
          resourceType: itemToBookmark.resource_type,
          folderId: folderId,
          title: itemToBookmark.title,
        }),
      });

      if (!bookmarkResponse.ok) throw new Error("Failed to add bookmark");

      onBookmarkAdded(folderId); // Pass folderId to update counts

      // Optionally, fetch folders again to ensure counts are updated
      if (typeof fetchFolders === "function") {
        fetchFolders();
      }

      onClose();
    } catch (error) {
      console.error("Error saving bookmark:", error);
      toast({
        title: "Error saving bookmark",
        description: error.message || "An unexpected error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Bookmark</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {folders.length > 0 && (
              <FormControl>
                <FormLabel>Select Folder</FormLabel>
                <Select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                >
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
              onChange={(e) => setCreatingNewFolder(e.target.checked)}
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
          <Button colorScheme="blue" onClick={handleSave}>
            Save Bookmark
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BookmarkModal;
