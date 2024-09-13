// pages/library.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  SimpleGrid,
  HStack,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import supabase from "../api/utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import FolderModal from "../components/FolderModal";

const LibraryView = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  useEffect(() => {
    if (selectedFolder) {
      fetchBookmarks();
    }
  }, [selectedFolder]);

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("name");

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

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("folder_id", selectedFolder.id);

      if (error) throw error;

      setBookmarks(data);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      toast({
        title: "Error fetching bookmarks",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSaveFolder = async () => {
    if (!folderName.trim()) return;

    if (editingFolder) {
      await updateFolder();
    } else {
      await createFolder();
    }
  };

  const createFolder = async () => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .insert({ user_id: user.id, name: folderName.trim() })
        .single();

      if (error) throw error;

      setFolders([...folders, data]);
      setFolderName("");
      onClose();
      toast({
        title: "New folder created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating new folder:", error);
      toast({
        title: "Error creating new folder",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateFolder = async () => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .update({ name: folderName.trim() })
        .eq("id", editingFolder.id)
        .single();

      if (error) throw error;

      setFolders(folders.map((f) => (f.id === data.id ? data : f)));
      setFolderName("");
      setEditingFolder(null);
      onClose();
      toast({
        title: "Folder updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating folder:", error);
      toast({
        title: "Error updating folder",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const deleteFolder = async (folder) => {
    try {
      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", folder.id);

      if (error) throw error;

      setFolders(folders.filter((f) => f.id !== folder.id));
      if (selectedFolder && selectedFolder.id === folder.id) {
        setSelectedFolder(null);
        setBookmarks([]);
      }
      toast({
        title: "Folder deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error deleting folder",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const removeBookmark = async (bookmark) => {
    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", bookmark.id);

      if (error) throw error;

      setBookmarks(bookmarks.filter((b) => b.id !== bookmark.id));
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
    }
  };

  return (
    <Box p={4}>
      <Heading as="h1" size="xl" mb={6}>
        My Bookmarks
      </Heading>

      <Button
        leftIcon={<FaPlus />}
        onClick={() => {
          setEditingFolder(null);
          setFolderName("");
          onOpen();
        }}
        colorScheme="green"
        mb={4}
      >
        Create New Folder
      </Button>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={8}>
        {folders.map((folder) => (
          <Box key={folder.id} p={4} borderWidth={1} borderRadius="md">
            <Heading as="h3" size="md" mb={2}>
              {folder.name}
            </Heading>
            <HStack>
              <Button
                size="sm"
                onClick={() => setSelectedFolder(folder)}
                colorScheme="blue"
              >
                View Bookmarks
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditingFolder(folder);
                  setFolderName(folder.name);
                  onOpen();
                }}
                leftIcon={<FaEdit />}
              >
                Edit
              </Button>
              <Button
                size="sm"
                onClick={() => deleteFolder(folder)}
                colorScheme="red"
                leftIcon={<FaTrash />}
              >
                Delete
              </Button>
            </HStack>
          </Box>
        ))}
      </SimpleGrid>

      {selectedFolder && (
        <Box>
          <Heading as="h2" size="lg" mb={4}>
            Bookmarks in {selectedFolder.name}
          </Heading>
          {bookmarks.length === 0 ? (
            <Text>No bookmarks in this folder.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {bookmarks.map((bookmark) => (
                <Box key={bookmark.id} p={4} borderWidth={1} borderRadius="md">
                  <Heading as="h4" size="sm" mb={2}>
                    {bookmark.title}
                  </Heading>
                  <Text fontSize="sm" mb={2}>
                    Type: {bookmark.resource_type}
                  </Text>
                  <Button
                    size="sm"
                    onClick={() => removeBookmark(bookmark)}
                    colorScheme="red"
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      )}

      <FolderModal
        isOpen={isOpen}
        onClose={onClose}
        folderName={folderName}
        setFolderName={setFolderName}
        onSave={handleSaveFolder}
        mode={editingFolder ? "edit" : "create"}
      />
    </Box>
  );
};

export default LibraryView;
