// components/dashboard/FolderModal.js

import React, { useState } from "react";
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
import supabase from "@/pages/api/utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";

const FolderModal = ({ isOpen, onClose, fetchFolders }) => {
  const { user } = useAuth();
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("#000000");
  const toast = useToast();

  const handleCreateFolder = async () => {
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
      const { data, error } = await supabase
        .from("folders")
        .insert({
          name: folderName.trim(),
          color: folderColor,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Folder created.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setFolderName("");
      setFolderColor("#000000");
      onClose();

      // Fetch folders again to update the list
      fetchFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error creating folder",
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
        <ModalHeader>Create New Folder</ModalHeader>
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
          <Button colorScheme="blue" onClick={handleCreateFolder}>
            Create Folder
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FolderModal;
