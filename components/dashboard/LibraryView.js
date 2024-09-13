// pages/dashboard/library.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  useToast,
} from "@chakra-ui/react";
import supabase from "../../api/utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import DashboardLayout from "../../components/DashboardLayout";

const LibraryView = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { folderId } = router.query;
  const [bookmarks, setBookmarks] = useState([]);
  const [folderName, setFolderName] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (user && folderId) {
      fetchBookmarks();
      fetchFolderName();
    }
  }, [user, folderId]);

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*, folders(*)")
        .eq("user_id", user.id)
        .eq("folder_id", folderId);

      if (error) throw error;

      setBookmarks(data || []);
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

  const fetchFolderName = async () => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("name")
        .eq("id", folderId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setFolderName(data.name);
    } catch (error) {
      console.error("Error fetching folder name:", error);
    }
  };

  const removeBookmark = async (bookmarkId) => {
    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", bookmarkId)
        .eq("user_id", user.id);

      if (error) throw error;

      setBookmarks(bookmarks.filter((b) => b.id !== bookmarkId));
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
    <DashboardLayout>
      <Box p={4}>
        <Heading as="h1" size="xl" mb={6}>
          {folderName ? `Bookmarks in "${folderName}"` : "My Bookmarks"}
        </Heading>
        {bookmarks.length === 0 ? (
          <Text>No bookmarks in this folder.</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {bookmarks.map((bookmark) => (
              <Box key={bookmark.id} p={4} borderWidth={1} borderRadius="md">
                <Heading as="h4" size="sm" mb={2}>
                  {bookmark.title || "Untitled"}
                </Heading>
                <Text fontSize="sm" mb={2}>
                  Type: {bookmark.resource_type}
                </Text>
                <Button
                  size="sm"
                  onClick={() => removeBookmark(bookmark.id)}
                  colorScheme="red"
                >
                  Remove
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default LibraryView;
