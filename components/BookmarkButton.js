import React, { useState, useEffect } from "react";
import { Button, Icon, useDisclosure, Box, useToast } from "@chakra-ui/react";
import { FaBookmark } from "react-icons/fa";
import supabase from "../pages/api/utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./LoginModal";
import FolderSelect from "./FolderSelect";

const BookmarkButton = ({ resourceId, resourceType, onBookmarkChange }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const fetchFolders = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("folders")
            .select("*")
            .order("name");

          if (error) throw error;

          setFolders(data);
          const uncategorizedFolder = data.find(
            (folder) => folder.name === "Uncategorized"
          );
          setSelectedFolderId(uncategorizedFolder.id);
        } catch (error) {
          console.error("Error fetching folders:", error);
          toast({
            title: "Error fetching folders",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    };

    const checkBookmarkStatus = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("bookmarks")
            .select("*, folders(*)")
            .eq("bookmarked_resource", resourceId)
            .eq("resource_type", resourceType)
            .single();

          if (error && error.code !== "PGRST116") throw error;

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
      } else {
        setIsLoading(false);
      }
    };

    fetchFolders();
    checkBookmarkStatus();
  }, [user, resourceId, resourceType, toast]);

  const toggleBookmark = async () => {
    if (!user) {
      onOpen();
      return;
    }
    setIsLoading(true);
    try {
      if (isBookmarked) {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("bookmarked_resource", resourceId)
          .eq("resource_type", resourceType);
      } else {
        await supabase.from("bookmarks").insert({
          user_id: user.id,
          bookmarked_resource: resourceId,
          resource_type: resourceType,
          folder_id: selectedFolderId,
        });
      }
      setIsBookmarked(!isBookmarked);
      if (onBookmarkChange) {
        onBookmarkChange(resourceId);
      }
      toast({
        title: isBookmarked ? "Bookmark removed" : "Bookmark added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast({
        title: "Error updating bookmark",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderChange = async (newFolderId) => {
    setSelectedFolderId(newFolderId);
    if (isBookmarked) {
      try {
        await supabase
          .from("bookmarks")
          .update({ folder_id: newFolderId })
          .eq("user_id", user.id)
          .eq("bookmarked_resource", resourceId)
          .eq("resource_type", resourceType);
        toast({
          title: "Bookmark folder updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error updating bookmark folder:", error);
        toast({
          title: "Error updating bookmark folder",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <>
      <Box>
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
          mb={2}
        >
          {isBookmarked ? "Bookmarked" : "Add to bookmarks"}
        </Button>
        {isBookmarked && (
          <FolderSelect
            folders={folders}
            selectedFolderId={selectedFolderId}
            onChange={handleFolderChange}
          />
        )}
      </Box>
      <LoginModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default BookmarkButton;
