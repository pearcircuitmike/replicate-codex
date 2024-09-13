// components/FolderModal.js
import React from "react";
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
  VStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { SketchPicker } from "react-color";

const FolderModal = ({
  isOpen,
  onClose,
  folderName,
  setFolderName,
  folderColor,
  setFolderColor,
  onSave,
  mode,
  folders,
  selectedFolderId,
  setSelectedFolderId,
  onSelectFolder,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {mode === "create" ? "Add to Folder" : "Edit Folder"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {mode === "create" && (
              <>
                <Text fontWeight="bold">Select a folder:</Text>
                {folders && folders.length > 0 ? (
                  folders.map((folder) => (
                    <Button
                      key={folder.id}
                      onClick={() => setSelectedFolderId(folder.id)}
                      variant={
                        selectedFolderId != null &&
                        selectedFolderId === folder.id
                          ? "solid"
                          : "outline"
                      }
                      colorScheme="blue"
                      leftIcon={
                        <Box
                          width="16px"
                          height="16px"
                          borderRadius="50%"
                          bg={folder.color || "gray.500"}
                        />
                      }
                    >
                      {folder.name}
                    </Button>
                  ))
                ) : (
                  <Text>No folders available. Create a new one below.</Text>
                )}
                <Text fontWeight="bold">Or create a new folder:</Text>
              </>
            )}
            <Input
              placeholder="Folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
            <Text fontWeight="bold">Select a color:</Text>
            <SketchPicker
              color={folderColor}
              onChangeComplete={(color) => setFolderColor(color.hex)}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onSave}>
            {mode === "create" ? "Create and Add" : "Save Changes"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FolderModal;
