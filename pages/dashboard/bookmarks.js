// /pages/dashboard/bookmarks.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import DashboardLayout from "../../components/Dashboard/Layout/DashboardLayout";
import FolderModal from "../../components/Dashboard/Modals/FolderModal";
import BookmarkHeader from "../../components/Bookmarks/BookmarkHeader";
import BookmarkSearch from "../../components/Bookmarks/BookmarkSearch";
import BookmarkTabs from "../../components/Bookmarks/BookmarkTabs";
import CollectionsSidebar from "../../components/Bookmarks/CollectionsSidebar";
import { useAuth } from "../../context/AuthContext";
import { useFolders } from "@/context/FoldersContext";
import supabase from "@/pages/api/utils/supabaseClient";

const BookmarksPage = () => {
  const { user } = useAuth();
  const { folders, updateFolderCount, fetchFolders } = useFolders();

  const handleFolderModalClose = useCallback(() => {
    setIsFolderModalOpen(false);
    fetchFolders(); // Refresh folders list when modal closes
  }, [fetchFolders]);
  const [paperBookmarks, setPaperBookmarks] = useState([]);
  const [modelBookmarks, setModelBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isLoadingPapers, setIsLoadingPapers] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const resourceCache = useRef({});

  const fetchResourceData = useCallback(async (id, type) => {
    if (resourceCache.current[id]) {
      return resourceCache.current[id];
    }

    const apiRoute =
      type === "paper" ? "/api/fetch-paper-by-id" : "/api/fetch-model-by-id";

    try {
      const response = await fetch(`${apiRoute}?id=${id}`);
      if (!response.ok) {
        console.error(`Failed to fetch resource data for ID: ${id}`);
        return null;
      }
      const resourceData = await response.json();
      resourceCache.current[id] = resourceData;
      return resourceData;
    } catch (error) {
      console.error(`Error fetching resource data:`, error);
      return null;
    }
  }, []);

  const fetchForType = useCallback(
    async (type, folderId) => {
      if (!user) return;

      const setLoading =
        type === "paper" ? setIsLoadingPapers : setIsLoadingModels;
      const setBookmarks =
        type === "paper" ? setPaperBookmarks : setModelBookmarks;

      try {
        setLoading(true);
        let query = supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", user.id)
          .eq("resource_type", type);

        if (folderId) {
          query = query.eq("folder_id", folderId);
        }

        const { data: bookmarksData, error: bookmarksError } = await query;

        if (bookmarksError) throw bookmarksError;

        if (!bookmarksData || bookmarksData.length === 0) {
          setBookmarks([]);
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

        setBookmarks(validResourcesData);
      } catch (error) {
        console.error(`Error fetching ${type} bookmarks:`, error);
        setBookmarks([]);
      } finally {
        setLoading(false);
      }
    },
    [user, fetchResourceData]
  );

  useEffect(() => {
    if (selectedFolder) {
      fetchForType("paper", selectedFolder.id);
      fetchForType("model", selectedFolder.id);
    }
  }, [selectedFolder, fetchForType]);

  // Find and select Uncategorized folder by default
  useEffect(() => {
    const uncategorized = folders.find((f) => f.name === "Uncategorized");
    if (uncategorized) {
      setSelectedFolder(uncategorized);
    }
  }, [folders]);

  const handleRemoveBookmark = useCallback(
    async (bookmarkId, type, folderId) => {
      // Update folder count
      updateFolderCount(folderId, false); // false means decrement

      // Refresh the bookmark lists for both types since we want counts to stay in sync
      fetchForType("paper", selectedFolder?.id);
      fetchForType("model", selectedFolder?.id);
    },
    [fetchForType, selectedFolder, updateFolderCount]
  );

  const filteredPaperBookmarks = paperBookmarks.filter((bookmark) => {
    const paper = bookmark.resourceData;
    if (!paper || !paper.title) return false;
    return paper.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredModelBookmarks = modelBookmarks.filter((bookmark) => {
    const model = bookmark.resourceData;
    if (!model || !model.modelName) return false;
    return model.modelName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout>
      <Grid templateColumns="1fr 300px" gap={8} px={8} py={6}>
        <GridItem>
          <BookmarkHeader
            paperCount={paperBookmarks.length}
            modelCount={modelBookmarks.length}
          />
          <BookmarkSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <BookmarkTabs
            paperBookmarks={filteredPaperBookmarks}
            modelBookmarks={filteredModelBookmarks}
            isLoadingPapers={isLoadingPapers}
            isLoadingModels={isLoadingModels}
            onRemoveBookmark={handleRemoveBookmark}
          />
        </GridItem>

        <GridItem>
          <CollectionsSidebar
            folders={folders}
            selectedFolderId={selectedFolder?.id}
            onFolderSelect={setSelectedFolder}
            onNewCollection={() => setIsFolderModalOpen(true)}
            onFoldersRefresh={fetchFolders}
          />
        </GridItem>
      </Grid>

      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={handleFolderModalClose}
        fetchFolders={fetchFolders}
      />
    </DashboardLayout>
  );
};

export default BookmarksPage;
