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
import { useAuth } from "../../context/AuthContext";
import supabase from "@/pages/api/utils/supabaseClient";

const FolderModal = ({
  isOpen,
  onClose,
  fetchFolders,
  editingFolder = null,
}) => {
  const [folderName, setFolderName] = useState(
    editingFolder ? editingFolder.name : ""
  );
  const [folderColor, setFolderColor] = useState(
    editingFolder ? editingFolder.color : "#000000"
  );
  const toast = useToast();
  const { user } = useAuth();

  const handleSaveFolder = async () => {
    if (!folderName.trim()) {
      toast({
        title: "Folder name is required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

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

    try {
      let folderData;
      if (editingFolder) {
        const { data, error } = await supabase
          .from("folders")
          .update({ name: folderName.trim(), color: folderColor })
          .eq("id", editingFolder.id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        folderData = data;
      } else {
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
        folderData = data;
      }

      toast({
        title: `Folder ${editingFolder ? "updated" : "created"}.`,
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
