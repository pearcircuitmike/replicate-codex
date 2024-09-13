// components/BookmarkButton.js
import React, { useState, useEffect } from "react";
import { Button, Icon, useDisclosure, useToast } from "@chakra-ui/react";
import { FaBookmark } from "react-icons/fa";
import supabase from "../pages/api/utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./LoginModal";
import FolderModal from "./FolderModal";

const BookmarkButton = ({ resourceId, resourceType, onBookmarkChange }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("#000000"); // Default color
  const { user } = useAuth();
  const {
    isOpen: isFolderModalOpen,
    onOpen: onFolderModalOpen,
    onClose: onFolderModalClose,
  } = useDisclosure();
  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      fetchFolders();
      checkBookmarkStatus();
    } else {
      setIsLoading(false);
    }
  }, [user, resourceId, resourceType]);

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("name");

      if (error) throw error;

      setFolders(data || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Error fetching folders",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setFolders([]);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*, folders(*)")
        .eq("bookmarked_resource", resourceId)
        .eq("resource_type", resourceType)
        .maybeSingle();

      if (error) throw error;

      setIsBookmarked(!!data);
      if (data && data.folders) {
        setSelectedFolderId(data.folders.id);
      }
    } catch (error) {
      console.error("Error checking bookmark status:", error);
      toast({
        title: "Error checking bookmark status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      onLoginOpen();
      return;
    }
    if (isBookmarked) {
      await removeBookmark();
    } else {
      onFolderModalOpen();
    }
  };

  const addBookmark = async (folderId) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .insert({
          user_id: user.id,
          bookmarked_resource: resourceId,
          resource_type: resourceType,
          folder_id: folderId,
        })
        .select();

      if (error) throw error;

      setIsBookmarked(true);
      setSelectedFolderId(folderId);
      if (onBookmarkChange) onBookmarkChange(resourceId);
      toast({
        title: "Bookmark added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onFolderModalClose();
    } catch (error) {
      console.error("Error adding bookmark:", error);
      toast({
        title: "Error adding bookmark",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeBookmark = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("bookmarked_resource", resourceId)
        .eq("resource_type", resourceType);

      if (error) throw error;

      setIsBookmarked(false);
      setSelectedFolderId(null);
      if (onBookmarkChange) onBookmarkChange(resourceId);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFolder = async () => {
    if (!folderName.trim()) return;

    try {
      const { data, error } = await supabase
        .from("folders")
        .insert({
          user_id: user.id,
          name: folderName.trim(),
          color: folderColor,
        })
        .select();

      if (error || !data) {
        throw new Error("Folder creation failed");
      }

      const newFolder = data[0];
      setFolders((prevFolders) => [...prevFolders, newFolder]);
      setSelectedFolderId(newFolder.id);
      await addBookmark(newFolder.id);
      setFolderName("");
      setFolderColor("#000000");
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

  const handleSelectFolder = () => {
    if (selectedFolderId) {
      addBookmark(selectedFolderId);
    }
  };

  return (
    <>
      <Button
        onClick={toggleBookmark}
        isLoading={isLoading}
        leftIcon={
          <Icon
            as={FaBookmark}
            color={isBookmarked ? "yellow.500" : "gray.500"}
          />
        }
        variant="outline"
        w="100%"
        borderTopRadius="0"
        boxShadow="0"
      >
        {isBookmarked ? "Bookmarked" : "Add to bookmarks"}
      </Button>

      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={onFolderModalClose}
        folderName={folderName}
        setFolderName={setFolderName}
        folderColor={folderColor}
        setFolderColor={setFolderColor}
        onSave={handleSaveFolder}
        mode="create"
        folders={folders}
        selectedFolderId={selectedFolderId}
        setSelectedFolderId={setSelectedFolderId}
        onSelectFolder={handleSelectFolder}
      />

      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
    </>
  );
};

export default BookmarkButton;
