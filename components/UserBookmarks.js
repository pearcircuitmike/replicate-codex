import React, { useState, useEffect, useCallback } from "react";
import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import PaperCard from "./PaperCard";
import ModelCard from "./ModelCard";

const UserBookmarks = ({ resourceType }) => {
  const { user } = useAuth();
  const [bookmarkedResources, setBookmarkedResources] = useState([]);

  const fetchBookmarkedResources = useCallback(async () => {
    if (user) {
      try {
        const response = await fetch(
          `/api/dashboard/bookmarks?userId=${user.id}&resourceType=${resourceType}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch bookmarked resources");
        }
        const data = await response.json();
        setBookmarkedResources(data);
      } catch (error) {
        console.error("Error fetching bookmarked resources:", error);
      }
    }
  }, [user, resourceType]);

  useEffect(() => {
    fetchBookmarkedResources();
  }, [fetchBookmarkedResources]);

  const handleBookmarkChange = useCallback((resourceId) => {
    setBookmarkedResources((prevResources) =>
      prevResources.filter((resource) => resource.id !== resourceId)
    );
  }, []);

  const renderResourceCard = (resource) => {
    switch (resourceType) {
      case "paper":
        return (
          <PaperCard
            key={resource.id}
            paper={resource}
            onBookmarkChange={() => handleBookmarkChange(resource.id)}
          />
        );
      case "model":
        return (
          <ModelCard
            key={resource.id}
            model={resource}
            onBookmarkChange={() => handleBookmarkChange(resource.id)}
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
