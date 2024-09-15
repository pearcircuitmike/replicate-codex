// components/dashboard/BookmarkButton.js

import React, { useState, useEffect } from "react";
import { Button, Icon, useDisclosure, useToast } from "@chakra-ui/react";
import { FaBookmark } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "./LoginModal";
import BookmarkModal from "./dashboard/BookmarkModal";
import supabase from "@/pages/api/utils/supabaseClient";

const BookmarkButton = ({
  resourceId,
  resourceType,
  onBookmarkChange,
  title,
  updateFolderCount,
  fetchFolders,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const {
    isOpen: isBookmarkModalOpen,
    onOpen: onBookmarkModalOpen,
    onClose: onBookmarkModalClose,
  } = useDisclosure();
  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      checkBookmarkStatus();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, resourceId, resourceType]);

  const checkBookmarkStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch(
        `/api/dashboard/check-bookmark-status?resourceId=${resourceId}&resourceType=${resourceType}`,
        {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to check bookmark status");
      const data = await response.json();
      setIsBookmarked(data.isBookmarked);
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
      onBookmarkModalOpen();
    }
  };

  const removeBookmark = async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch("/api/dashboard/remove-bookmark", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          resourceId,
          resourceType,
        }),
      });

      if (!response.ok) throw new Error("Failed to remove bookmark");

      const data = await response.json();
      setIsBookmarked(false);
      if (onBookmarkChange) onBookmarkChange(resourceId);
      toast({
        title: "Bookmark removed",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (updateFolderCount && data.folderId) {
        updateFolderCount(data.folderId, false);
      }

      if (typeof fetchFolders === "function") {
        fetchFolders(); // Refresh folders after removal
      }
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

  const handleBookmarkAdded = (folderId) => {
    setIsBookmarked(true);
    if (onBookmarkChange) onBookmarkChange(resourceId);
    toast({
      title: "Bookmark added",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    onBookmarkModalClose();

    if (updateFolderCount) {
      updateFolderCount(folderId, true);
    }

    if (typeof fetchFolders === "function") {
      fetchFolders(); // Refresh folders after addition
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

      <BookmarkModal
        isOpen={isBookmarkModalOpen}
        onClose={onBookmarkModalClose}
        itemToBookmark={{
          resource_id: resourceId,
          resource_type: resourceType,
          title: title,
        }}
        onBookmarkAdded={handleBookmarkAdded}
        fetchFolders={fetchFolders} // Pass fetchFolders to BookmarkModal
      />

      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
    </>
  );
};

export default BookmarkButton;
