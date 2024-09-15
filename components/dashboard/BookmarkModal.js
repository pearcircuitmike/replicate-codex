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
import { useFolders } from "@/context/FoldersContext";

const BookmarkModal = ({
  isOpen,
  onClose,
  itemToBookmark,
  onBookmarkAdded,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [creatingNewFolder, setCreatingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#A0AEC0"); // Default gray color
  const toast = useToast();
  const { user, accessToken } = useAuth(); // Destructure accessToken
  const { fetchFolders, folders, updateFolderCount } = useFolders();

  useEffect(() => {
    if (isOpen && user) {
      fetchFoldersInternal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const fetchFoldersInternal = async () => {
    try {
      await fetchFolders(); // Fetch folders from context
      // Automatically select "Uncategorized" if it's the only folder
      if (
        folders.length === 1 &&
        folders[0].name.toLowerCase() === "uncategorized"
      ) {
        setSelectedFolderId(folders[0].id);
      } else {
        setSelectedFolderId(folders[0]?.id || "");
      }
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
              Authorization: `Bearer ${accessToken || ""}`, // Use accessToken from context
            },
            body: JSON.stringify({
              name: newFolderName.trim(),
              color: newFolderColor,
            }),
          }
        );

        const folderData = await folderResponse.json();

        if (!folderResponse.ok) {
          throw new Error(folderData.error || "Failed to create new folder");
        }

        const newFolder = folderData.folder;
        folderId = newFolder.id;
        console.log("New folder created:", newFolder);

        // Optionally, show a toast
        toast({
          title: "Folder created",
          description: `Folder "${newFolder.name}" has been created.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // No need to update folder count since it's a new folder with 0 bookmarks
      }

      // Add bookmark to the selected folder
      const bookmarkResponse = await fetch("/api/dashboard/add-bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken || ""}`, // Use accessToken from context
        },
        body: JSON.stringify({
          resourceId: itemToBookmark.resource_id,
          resourceType: itemToBookmark.resource_type,
          folderId: folderId,
          title: itemToBookmark.title,
        }),
      });

      const bookmarkData = await bookmarkResponse.json();

      if (!bookmarkResponse.ok) {
        throw new Error(bookmarkData.error || "Failed to add bookmark");
      }

      console.log("Bookmark added:", bookmarkData);

      onBookmarkAdded(folderId); // Pass folderId to update counts

      // Optionally, fetch folders again to ensure counts are updated
      await fetchFolders();
      console.log("fetchFolders called after adding bookmark");

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
