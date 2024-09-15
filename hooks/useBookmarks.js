import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import supabase from "@/pages/api/utils/supabaseClient";

export const useBookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("bookmarked_resource, resource_type")
        .eq("user_id", user.id);
      if (error) throw error;
      const bookmarksMap = data.reduce((acc, bookmark) => {
        acc[`${bookmark.resource_type}-${bookmark.bookmarked_resource}`] = true;
        return acc;
      }, {});
      setBookmarks(bookmarksMap);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const isBookmarked = (resourceId, resourceType) => {
    return !!bookmarks[`${resourceType}-${resourceId}`];
  };

  return {
    isBookmarked,
    fetchBookmarks,
    isLoading,
  };
};
