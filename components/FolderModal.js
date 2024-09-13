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
} from "@chakra-ui/react";

const FolderModal = ({
  isOpen,
  onClose,
  folderName,
  setFolderName,
  onSave,
  mode,
  folders,
  selectedFolderId,
  setSelectedFolderId,
  onSelectFolder,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {mode === "create" ? "Add to Folder" : "Edit Folder"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold">Select a folder:</Text>
            {folders && folders.length > 0 ? (
              folders.map((folder) => (
                <Button
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  variant={
                    selectedFolderId != null && selectedFolderId === folder.id
                      ? "solid"
                      : "outline"
                  }
                  colorScheme="blue"
                >
                  {folder.name}
                </Button>
              ))
            ) : (
              <Text>No folders available. Create a new one below.</Text>
            )}
            <Text fontWeight="bold">Or create a new folder:</Text>
            <Input
              placeholder="New folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={selectedFolderId != null ? onSelectFolder : onSave}
          >
            {selectedFolderId != null
              ? "Add to Selected Folder"
              : "Create and Add"}
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
