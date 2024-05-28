// components/BookmarkButton.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button, Icon, useToast, useDisclosure } from "@chakra-ui/react";
import { FaBookmark } from "react-icons/fa"; // Changed from FaHeart to FaBookmark
import supabase from "../utils/supabaseClient";
import LoginModal from "./LoginModal";

const BookmarkButton = ({ resourceType, resourceId, onBookmarkChange }) => {
  const { user } = useAuth();
  const [isBookmark, setIsBookmark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const checkBookmark = async () => {
      setIsLoading(true);
      if (user) {
        const { data, error } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", user.id)
          .eq("bookmarked_resource", resourceId)
          .eq("resource_type", resourceType);

        if (error) {
          console.error("Error checking Bookmark status:", error);
        } else {
          setIsBookmark(data.length > 0);
        }
      }
      setIsLoading(false);
    };

    checkBookmark();
  }, [user, resourceType, resourceId]);

  const toggleBookmark = async () => {
    if (!user) {
      onOpen();
      return;
    }

    try {
      setIsLoading(true);

      if (isBookmark) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("bookmarked_resource", resourceId)
          .eq("resource_type", resourceType);

        if (error) {
          console.error("Error removing bookmark:", error);
          return;
        }
      } else {
        const { error } = await supabase.from("bookmarks").insert({
          user_id: user.id,
          bookmarked_resource: resourceId,
          resource_type: resourceType,
        });

        if (error) {
          console.error("Error adding Bookmark:", error);
          return;
        }
      }

      setIsBookmark(!isBookmark);
      toast({
        title: isBookmark ? "Removed from Bookmarks" : "Added to Bookmarks",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onBookmarkChange && onBookmarkChange();
    } catch (error) {
      console.error("Error toggling Bookmark:", error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={toggleBookmark}
        isLoading={isLoading}
        loadingText="Updating..."
      >
        <Icon
          as={FaBookmark}
          color={isBookmark ? "yellow.500" : "gray.500"}
          mr={2}
        />
        {isBookmark ? "Bookmarked" : "Add to bookmarks"}
      </Button>
      <LoginModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default BookmarkButton;
