import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const [paperBookmarks, setPaperBookmarks] = useState([]);
  const [modelBookmarks, setModelBookmarks] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const resourceCache = useRef({});

  const fetchResourceData = useCallback(async (id, type) => {
    if (resourceCache.current[id]) {
      return resourceCache.current[id];
    }

    const apiRoute =
      type === "paper" ? "/api/fetch-paper-by-id" : "/api/fetch-model-by-id";
    const response = await fetch(`${apiRoute}?id=${id}`);
    if (!response.ok) {
      console.error(`Failed to fetch resource data for ID: ${id}`);
      return null;
    }
    const resourceData = await response.json();
    resourceCache.current[id] = resourceData;
    return resourceData;
  }, []);

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
        const { data: bookmarksData, error: bookmarksError } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("folder_id", folderId)
          .eq("user_id", user.id)
          .eq("resource_type", type);

        if (bookmarksError) throw bookmarksError;

        if (!bookmarksData || bookmarksData.length === 0) {
          type === "paper" ? setPaperBookmarks([]) : setModelBookmarks([]);
          setLoading(false);
          return;
        }

        const uniqueResourceIds = [
          ...new Set(bookmarksData.map((b) => b.bookmarked_resource)),
        ];
        const resourcesData = await Promise.all(
          uniqueResourceIds.map((id) => fetchResourceData(id, type))
        );

        const validResourcesData = bookmarksData
          .map((bookmark) => ({
            ...bookmark,
            resourceData: resourcesData.find(
              (r) => r && r.id === bookmark.bookmarked_resource
            ),
          }))
          .filter((bookmark) => bookmark.resourceData !== undefined);

        type === "paper"
          ? setPaperBookmarks(validResourcesData)
          : setModelBookmarks(validResourcesData);
      } catch (error) {
        console.error(`Error fetching ${type} bookmarks:`, error);
      } finally {
        setLoading(false);
      }
    },
    [folderId, user, fetchResourceData]
  );

  useEffect(() => {
    if (folderId && user) {
      fetchBookmarkResources("paper");
      fetchBookmarkResources("model");
    }
  }, [folderId, user, fetchBookmarkResources]);

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

  const renderPaperCard = useCallback(
    (bookmark) => {
      const paper = bookmark.resourceData;
      if (!paper) return null;
      return (
        <PaperCard
          key={bookmark.id}
          paper={paper}
          onBookmarkChange={() => fetchBookmarkResources("paper")}
        />
      );
    },
    [fetchBookmarkResources]
  );

  const renderModelCard = useCallback(
    (bookmark) => {
      const model = bookmark.resourceData;
      if (!model) return null;
      return (
        <ModelCard
          key={bookmark.id}
          model={model}
          onBookmarkChange={() => fetchBookmarkResources("model")}
        />
      );
    },
    [fetchBookmarkResources]
  );

  return (
    <DashboardLayout>
      <Box p={4}>
        <Heading size="md" mb={4}>
          {folderName ? `Bookmarks in "${folderName}"` : "My Bookmarks"}
        </Heading>
        <Tabs>
          <TabList>
            <Tab>Papers</Tab>
            <Tab>Models</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {loading ? (
                <Text>Loading...</Text>
              ) : paperBookmarks.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {paperBookmarks.map(renderPaperCard)}
                </SimpleGrid>
              ) : (
                <Text>No paper bookmarks found in this folder.</Text>
              )}
            </TabPanel>
            <TabPanel>
              {loading ? (
                <Text>Loading...</Text>
              ) : modelBookmarks.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {modelBookmarks.map(renderModelCard)}
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
