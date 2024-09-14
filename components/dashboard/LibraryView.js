import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  useToast,
} from "@chakra-ui/react";
import supabase from "@/pages/api/utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const LibraryView = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { folderId } = router.query;
  const [bookmarks, setBookmarks] = useState([]);
  const [folderName, setFolderName] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (user && folderId) {
      console.log("Fetching bookmarks for folder:", folderId);
      fetchBookmarks();
      fetchFolderName();
    }
  }, [user, folderId]);

  const fetchBookmarks = async () => {
    try {
      console.log("Fetching bookmarks...");
      const { data, error } = await supabase
        .from("bookmarks")
        .select("id, title, resource_type, folder_id")
        .eq("user_id", user.id)
        .eq("folder_id", folderId);

      if (error) throw error;

      console.log("Fetched bookmarks:", data);
      setBookmarks(data || []);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      toast({
        title: "Error fetching bookmarks",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchFolderName = async () => {
    try {
      console.log("Fetching folder name...");
      const { data, error } = await supabase
        .from("folders")
        .select("name")
        .eq("id", folderId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      console.log("Fetched folder name:", data.name);
      setFolderName(data.name);
    } catch (error) {
      console.error("Error fetching folder name:", error);
      toast({
        title: "Error fetching folder name",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const removeBookmark = async (bookmarkId) => {
    try {
      console.log("Removing bookmark:", bookmarkId);
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
        description: error.message,
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
            {bookmarks.map((bookmark) => {
              console.log("Rendering bookmark:", bookmark);
              return (
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
              );
            })}
          </SimpleGrid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default LibraryView;
