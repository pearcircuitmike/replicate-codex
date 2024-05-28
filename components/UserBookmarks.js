import React, { useState, useEffect, useCallback } from "react";
import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabaseClient";
import PaperCard from "./PaperCard";
import ModelCard from "./ModelCard";

const getTableName = (resourceType) => {
  switch (resourceType) {
    case "paper":
      return "arxivPapersData";
    case "model":
      return "modelsData";
    default:
      throw new Error(`Unsupported resource type: ${resourceType}`);
  }
};

const UserBookmarks = ({ resourceType }) => {
  const { user } = useAuth();
  const [bookmarkedResources, setBookmarkedResources] = useState([]);
  const [triggerRefresh, setTriggerRefresh] = useState(false);

  const fetchBookmarkedResources = useCallback(async () => {
    if (user) {
      const { data: bookmarkData, error: bookmarkError } = await supabase
        .from("bookmarks")
        .select("bookmarked_resource, created_at")
        .eq("user_id", user.id)
        .eq("resource_type", resourceType)
        .order("created_at", { ascending: false });

      if (bookmarkError) {
        console.error("Error fetching bookmarks:", bookmarkError);
        return;
      }

      const resourceIds = bookmarkData.map(
        (bookmark) => bookmark.bookmarked_resource
      );

      const tableName = getTableName(resourceType);

      const { data: resources, error: resourcesError } = await supabase
        .from(tableName)
        .select("*")
        .in("id", resourceIds);

      if (resourcesError) {
        console.error("Error fetching resource details:", resourcesError);
      } else {
        const orderedResources = resourceIds.map((id) =>
          resources.find((resource) => resource.id === id)
        );
        setBookmarkedResources(orderedResources);
      }
    }
  }, [user, resourceType]);

  useEffect(() => {
    fetchBookmarkedResources();
  }, [fetchBookmarkedResources, triggerRefresh]);

  const renderResourceCard = (resource) => {
    switch (resourceType) {
      case "paper":
        return (
          <PaperCard
            key={resource.id}
            paper={resource}
            onBookmarkChange={() => setTriggerRefresh((prev) => !prev)}
          />
        );
      case "model":
        return (
          <ModelCard
            key={resource.id}
            model={resource}
            onBookmarkChange={() => setTriggerRefresh((prev) => !prev)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box mt={8}>
      <Heading as="h2" size="lg" mb={4}>
        Bookmarked {resourceType}s
      </Heading>
      {bookmarkedResources.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          {bookmarkedResources.map((resource) => renderResourceCard(resource))}
        </SimpleGrid>
      ) : (
        <Text>
          You have no bookmarked {resourceType}s. You can click the bookmark
          button on the {resourceType} page or card to add them to your
          bookmarks.
        </Text>
      )}
    </Box>
  );
};

export default UserBookmarks;
