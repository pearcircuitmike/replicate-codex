// components/dashboard/BookmarkButton.js

import React, { useState, useEffect } from "react";
import { Button, Icon, useDisclosure, useToast } from "@chakra-ui/react";
import { FaBookmark } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "./LoginModal";
import BookmarkModal from "./dashboard/BookmarkModal";
import { useFolders } from "@/context/FoldersContext";

const BookmarkButton = ({
  resourceId,
  resourceType,
  onBookmarkChange,
  title,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, accessToken } = useAuth(); // Destructure accessToken
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
  const { fetchFolders, updateFolderCount, folders } = useFolders();

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
      const response = await fetch(
        `/api/dashboard/check-bookmark-status?resourceId=${resourceId}&resourceType=${resourceType}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken || ""}`, // Use accessToken from context
          },
        }
      );
      if (!response.ok) throw new Error("Failed to check bookmark status");
      const data = await response.json();
      setIsBookmarked(data.isBookmarked);
      console.log(
        `Bookmark status for resource ${resourceId}:`,
        data.isBookmarked
      );
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
      await ensureUncategorizedFolderAndOpenModal();
    }
  };

  const ensureUncategorizedFolderAndOpenModal = async () => {
    try {
      // Check if user has any folders
      if (folders.length === 0) {
        // Fetch or create "Uncategorized" folder
        const { folder, error } = await fetchOrCreateUncategorizedFolder();
        if (error) throw error;
        console.log("Uncategorized folder ensured:", folder);
      }
      // Refresh folders to include the new "Uncategorized" folder
      await fetchFolders();
      // Open the bookmark modal
      onBookmarkModalOpen();
    } catch (error) {
      console.error("Error ensuring Uncategorized folder:", error);
      toast({
        title: "Error ensuring Uncategorized folder",
        description: error.message || "An unexpected error occurred.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchOrCreateUncategorizedFolder = async () => {
    try {
      const response = await fetch(
        "/api/dashboard/get-or-create-uncategorized-folder",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken || ""}`, // Use accessToken from context
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get or create folder");
      }

      return { folder: data.folder, error: null };
    } catch (error) {
      console.error("Error fetching or creating Uncategorized folder:", error);
      return { folder: null, error };
    }
  };

  const removeBookmark = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/dashboard/remove-bookmark", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken || ""}`, // Use accessToken from context
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
        console.log(`Decremented bookmark count for folder ${data.folderId}`);
      }

      await fetchFolders(); // Refresh folders after removal
      console.log("fetchFolders called after removing bookmark");
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
    console.log(`Bookmark added to folder ${folderId}`);
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
      console.log(`Incremented bookmark count for folder ${folderId}`);
    }

    fetchFolders(); // Refresh folders after addition
    console.log("fetchFolders called after adding bookmark");
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
        isDisabled={isLoading} // Disable button while loading
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
      />

      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
    </>
  );
};

export default BookmarkButton;
