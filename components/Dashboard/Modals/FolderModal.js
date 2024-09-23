// components/dashboard/FolderModal.js
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
  Input,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { SketchPicker } from "react-color";
import { useAuth } from "../../../context/AuthContext";
import supabase from "@/pages/api/utils/supabaseClient";

const FolderModal = ({
  isOpen,
  onClose,
  fetchFolders,
  editingFolder = null,
}) => {
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("#000000");
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (editingFolder) {
      setFolderName(editingFolder.name);
      setFolderColor(editingFolder.color || "#000000");
    } else {
      setFolderName("");
      setFolderColor("#000000");
    }
  }, [editingFolder]);

  const handleSaveFolder = async () => {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to perform this action.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!folderName.trim()) {
      toast({
        title: "Folder name is required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const endpoint = editingFolder
        ? "/api/dashboard/edit-bookmark-folder"
        : "/api/dashboard/create-bookmark-folder";
      const method = editingFolder ? "PUT" : "POST";
      const body = editingFolder
        ? {
            folderId: editingFolder.id,
            name: folderName.trim(),
            color: folderColor,
          }
        : { name: folderName.trim(), color: folderColor };

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An error occurred");
      }

      const data = await response.json();

      toast({
        title: `Folder ${editingFolder ? "updated" : "created"} successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      fetchFolders();
    } catch (error) {
      console.error(
        `Error ${editingFolder ? "updating" : "creating"} folder:`,
        error
      );
      toast({
        title: `Error ${editingFolder ? "updating" : "creating"} folder`,
        description: error.message,
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
        <ModalHeader>
          {editingFolder ? "Edit Folder" : "Create New Folder"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Folder Name</FormLabel>
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Folder Color</FormLabel>
            <SketchPicker
              color={folderColor}
              onChangeComplete={(color) => setFolderColor(color.hex)}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSaveFolder}>
            {editingFolder ? "Save Changes" : "Create Folder"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FolderModal;
