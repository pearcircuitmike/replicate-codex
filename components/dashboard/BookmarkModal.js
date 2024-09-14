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
import supabase from "../../pages/api/utils/supabaseClient"; // Adjust the path as needed
import { useAuth } from "../../context/AuthContext"; // Adjust the path as needed

const BookmarkModal = ({ isOpen, onClose, itemToBookmark }) => {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("uncategorized");
  const [creatingNewFolder, setCreatingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#000000");
  const toast = useToast();

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) throw error;

      setFolders(data);
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
        } else if (uncategorizedError) {
          throw uncategorizedError;
        } else {
          folderId = uncategorizedFolder.id;
        }
      }

      // Add bookmark to the selected folder
      const { error: bookmarkError } = await supabase.from("bookmarks").insert({
        user_id: user.id,
        folder_id: folderId,
        resource_type: itemToBookmark.resource_type,
        resource_id: itemToBookmark.resource_id,
        title: itemToBookmark.title,
        // Add any other necessary fields
      });

      if (bookmarkError) throw bookmarkError;

      toast({
        title: "Bookmark added.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
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
