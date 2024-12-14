// /pages/dashboard/bookmarks.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, useBreakpointValue } from "@chakra-ui/react";
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
  const [paperBookmarks, setPaperBookmarks] = useState([]);
  const [modelBookmarks, setModelBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isLoadingPapers, setIsLoadingPapers] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const resourceCache = useRef({});
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleFolderModalClose = useCallback(() => {
    setIsFolderModalOpen(false);
    fetchFolders();
  }, [fetchFolders]);

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

  useEffect(() => {
    if (!selectedFolder && folders.length > 0) {
      const uncategorized = folders.find((f) => f.name === "Uncategorized");
      if (uncategorized) {
        setSelectedFolder(uncategorized);
      }
    }
  }, [folders, selectedFolder]);

  const handleRemoveBookmark = useCallback(
    async (bookmarkId, type, folderId) => {
      updateFolderCount(folderId, false);

      if (type === "paper") {
        setPaperBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      } else {
        setModelBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      }
    },
    [updateFolderCount]
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
      <Box maxW="1200px" mx="auto">
        {!isMobile && (
          <Box
            display={{ base: "none", md: "block" }}
            position="fixed"
            right="8"
            top="32"
            w="64"
          >
            <CollectionsSidebar
              folders={folders}
              selectedFolderId={selectedFolder?.id}
              onFolderSelect={setSelectedFolder}
              onNewCollection={() => setIsFolderModalOpen(true)}
              onFoldersRefresh={fetchFolders}
            />
          </Box>
        )}

        <Box px={4} py={6} mr={{ md: "300px" }}>
          <BookmarkHeader
            paperCount={paperBookmarks.length}
            modelCount={modelBookmarks.length}
            folderName={selectedFolder?.name}
            folderColor={selectedFolder?.color}
          />
          <BookmarkSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            mb={4}
          />

          {/* Mobile Categories Selector */}
          {isMobile && (
            <Box mb={4}>
              <Box
                as="select"
                w="full"
                p={2}
                borderColor="gray.200"
                borderWidth={1}
                borderRadius="md"
                value={selectedFolder?.id || ""}
                onChange={(e) => {
                  const folder = folders.find((f) => f.id === e.target.value);
                  setSelectedFolder(folder);
                }}
              >
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name} ({folder.bookmarkCount})
                  </option>
                ))}
              </Box>
            </Box>
          )}

          <BookmarkTabs
            paperBookmarks={filteredPaperBookmarks}
            modelBookmarks={filteredModelBookmarks}
            isLoadingPapers={isLoadingPapers}
            isLoadingModels={isLoadingModels}
            onRemoveBookmark={handleRemoveBookmark}
          />
        </Box>

        <FolderModal
          isOpen={isFolderModalOpen}
          onClose={handleFolderModalClose}
          fetchFolders={fetchFolders}
        />
      </Box>
    </DashboardLayout>
  );
};

export default BookmarksPage;
