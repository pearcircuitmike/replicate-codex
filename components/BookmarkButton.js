import React, { useState, useEffect, useCallback } from "react";
import { Button, Icon, useDisclosure, useToast } from "@chakra-ui/react";
import { FaBookmark } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "./LoginModal";
import BookmarkModal from "./Dashboard/Modals/BookmarkModal";
import { useFolders } from "@/context/FoldersContext";

const BookmarkButton = ({
  resourceId,
  resourceType,
  onBookmarkChange,
  title,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, accessToken } = useAuth();
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
  const { fetchFolders } = useFolders();

  const checkBookmarkStatus = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `/api/dashboard/check-bookmark-status?resourceId=${resourceId}&resourceType=${resourceType}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken || ""}`,
          },
          cache: "no-store", // Prevent caching
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
  }, [user, accessToken, resourceId, resourceType, toast]);

  useEffect(() => {
    checkBookmarkStatus();
  }, [checkBookmarkStatus]);

  const handleButtonClick = () => {
    if (!user) {
      onLoginOpen();
      return;
    }
    if (!isBookmarked) {
      onBookmarkModalOpen();
    } else {
      handleRemoveBookmark();
    }
  };

  const handleRemoveBookmark = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/dashboard/remove-bookmark", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken || ""}`,
        },
        body: JSON.stringify({
          resourceId,
          resourceType,
        }),
      });

      if (!response.ok) throw new Error("Failed to remove bookmark");

      setIsBookmarked(false);
      if (onBookmarkChange) onBookmarkChange(resourceId);
      toast({
        title: "Bookmark removed",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchFolders();
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

  const handleBookmarkAdded = useCallback(() => {
    setIsBookmarked(true);
    if (onBookmarkChange) onBookmarkChange(resourceId);
    toast({
      title: "Bookmark added",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    fetchFolders();
  }, [onBookmarkChange, resourceId, toast, fetchFolders]);

  return (
    <>
      <Button
        onClick={handleButtonClick}
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
        isDisabled={isLoading}
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
