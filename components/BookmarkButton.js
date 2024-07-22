import React, { useState, useEffect } from "react";
import { Button, Icon } from "@chakra-ui/react";
import { FaBookmark } from "react-icons/fa";
import supabase from "../pages/api/utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";

const BookmarkButton = ({ resourceId, resourceType, onBookmarkChange }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", user.id)
            .eq("bookmarked_resource", resourceId)
            .eq("resource_type", resourceType)
            .single();

          if (error && error.code !== "PGRST116") {
            console.error("Error checking bookmark status:", error);
          }
          setIsBookmarked(!!data);
        } catch (error) {
          console.error("Error checking bookmark status:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkBookmarkStatus();
  }, [user, resourceId, resourceType]);

  const toggleBookmark = async () => {
    if (!user) {
      // Redirect to login page if user is not authenticated
      router.push("/login");
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
        });
      }

      setIsBookmarked(!isBookmarked);
      if (onBookmarkChange) {
        onBookmarkChange(resourceId);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
};

export default BookmarkButton;
