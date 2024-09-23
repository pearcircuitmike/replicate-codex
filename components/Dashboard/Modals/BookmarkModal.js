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
  const [newFolderColor, setNewFolderColor] = useState("#A0AEC0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const { user, accessToken } = useAuth();
  const { fetchFolders, folders } = useFolders();

  useEffect(() => {
    if (isOpen && user) {
      fetchFoldersInternal();
    }
  }, [isOpen, user]);

  const fetchFoldersInternal = async () => {
    try {
      await fetchFolders();
      if (folders.length > 0) {
        setSelectedFolderId(folders[0].id);
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
    if (isSubmitting) return;
    setIsSubmitting(true);

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
          setIsSubmitting(false);
          return;
        }

        const folderResponse = await fetch(
          "/api/dashboard/create-bookmark-folder",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken || ""}`,
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

        folderId = folderData.folder.id;
      }

      const bookmarkResponse = await fetch("/api/dashboard/add-bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken || ""}`,
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

      onBookmarkAdded();
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
    } finally {
      setIsSubmitting(false);
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
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            Save Bookmark
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BookmarkModal;
