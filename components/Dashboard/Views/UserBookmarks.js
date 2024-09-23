import React, { useState, useEffect, useCallback } from "react";
import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useAuth } from "../../../context/AuthContext";
import PaperCard from "../../Cards/PaperCard";
import ModelCard from "../../Cards/ModelCard";

const UserBookmarks = ({ resourceType }) => {
  const { user } = useAuth();
  const [bookmarkedResources, setBookmarkedResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchBookmarkedResources = useCallback(async () => {
    if (user) {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/dashboard/bookmarks?userId=${user.id}&resourceType=${resourceType}`
        );
        if (!response.ok) throw new Error("Failed to fetch bookmarks");
        const data = await response.json();
        setBookmarkedResources(data);
      } catch (err) {
        console.error("Error fetching bookmarked resources:", err);
        setError("Failed to load bookmarks. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, resourceType]);

  useEffect(() => {
    fetchBookmarkedResources();
  }, [fetchBookmarkedResources, refreshTrigger]);

  const handleBookmarkChange = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const renderResourceCard = (resource) => {
    switch (resourceType) {
      case "paper":
        return (
          <PaperCard
            key={resource.id}
            paper={resource}
            onBookmarkChange={handleBookmarkChange}
          />
        );
      case "model":
        return (
          <ModelCard
            key={resource.id}
            model={resource}
            onBookmarkChange={handleBookmarkChange}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) return <Text>Loading bookmarks...</Text>;
  if (error) return <Text color="red.500">{error}</Text>;

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
