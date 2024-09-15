import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Text,
  Heading,
} from "@chakra-ui/react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PaperCard from "../../components/PaperCard";
import ModelCard from "../../components/ModelCard";
import { useRouter } from "next/router";
import supabase from "../api/utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";

const LibraryPage = () => {
  const router = useRouter();
  const { folderId } = router.query;
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [resourceType, setResourceType] = useState("paper");
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBookmarkResources = useCallback(
    async (type) => {
      if (!folderId || !user) {
        console.log(
          "fetchBookmarkResources: Missing folderId or user, skipping fetch."
        );
        return;
      }

      setLoading(true);

      try {
        // 1. Fetch bookmarks
        const { data: bookmarksData, error: bookmarksError } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("folder_id", folderId)
          .eq("user_id", user.id)
          .eq("resource_type", type);

        if (bookmarksError) throw bookmarksError;

        if (!bookmarksData || bookmarksData.length === 0) {
          setBookmarks([]);
          setLoading(false);
          return;
        }

        // 2. Fetch corresponding resources
        const resourcePromises = bookmarksData.map(async (bookmark) => {
          const apiRoute =
            type === "paper"
              ? "/api/fetch-paper-by-id"
              : "/api/fetch-model-by-id";
          const response = await fetch(
            `${apiRoute}?id=${bookmark.bookmarked_resource}`
          );
          if (!response.ok) {
            console.error(
              `Failed to fetch resource data for ID: ${bookmark.bookmarked_resource}`
            );
            return null;
          }
          const resourceData = await response.json();
          return { ...bookmark, resourceData };
        });

        const resourcesData = await Promise.all(resourcePromises);
        const validResourcesData = resourcesData.filter(
          (resource) => resource !== null
        );

        setBookmarks(validResourcesData);
      } catch (error) {
        console.error(`Error fetching ${type} bookmarks:`, error);
      } finally {
        setLoading(false);
      }
    },
    [folderId, user]
  );

  useEffect(() => {
    if (folderId && user) {
      fetchBookmarkResources(resourceType);
    }
  }, [folderId, user, fetchBookmarkResources, resourceType]);

  useEffect(() => {
    const fetchFolderName = async () => {
      if (!folderId || !user) return;

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

    fetchFolderName();
  }, [folderId, user]);

  const handleTabChange = (index) => {
    const newResourceType = index === 0 ? "paper" : "model";
    setResourceType(newResourceType);
    fetchBookmarkResources(newResourceType);
  };

  const renderCard = (bookmark) => {
    const resource = bookmark.resourceData;
    if (!resource) return null;

    if (resourceType === "paper") {
      return (
        <PaperCard
          key={bookmark.id}
          paper={resource}
          onBookmarkChange={() => fetchBookmarkResources(resourceType)}
        />
      );
    } else {
      return (
        <ModelCard
          key={bookmark.id}
          model={resource}
          onBookmarkChange={() => fetchBookmarkResources(resourceType)}
        />
      );
    }
  };

  return (
    <DashboardLayout>
      <Box p={4}>
        <Heading size="md" mb={4}>
          {folderName ? `Bookmarks in "${folderName}"` : "My Bookmarks"}
        </Heading>
        <Tabs onChange={handleTabChange}>
          <TabList>
            <Tab>Papers</Tab>
            <Tab>Models</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {loading ? (
                <Text>Loading...</Text>
              ) : bookmarks.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {bookmarks.map(renderCard)}
                </SimpleGrid>
              ) : (
                <Text>No paper bookmarks found in this folder.</Text>
              )}
            </TabPanel>
            <TabPanel>
              {loading ? (
                <Text>Loading...</Text>
              ) : bookmarks.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {bookmarks.map(renderCard)}
                </SimpleGrid>
              ) : (
                <Text>No model bookmarks found in this folder.</Text>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </DashboardLayout>
  );
};

export default LibraryPage;
