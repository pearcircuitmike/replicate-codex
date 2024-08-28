// components/Feed/Feed.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { VStack, Text, Spinner, Box, SimpleGrid } from "@chakra-ui/react";
import PaperCard from "../PaperCard";
import ModelCard from "../ModelCard";
import { useBookmarks } from "../../hooks/useBookmarks";
import { useAuth } from "../../context/AuthContext";

const Feed = ({
  resourceType,
  fetchParams,
  updateResultCount,
  isSearching,
}) => {
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [resources, setResources] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const feedRef = useRef();

  const fetchResources = useCallback(
    async (currentPage = 1, append = false) => {
      if (!user) return;
      setIsLoading(true);

      const apiRoute =
        resourceType === "papers"
          ? "/api/discover/papers"
          : "/api/discover/models";
      const url = `${apiRoute}?${new URLSearchParams({
        ...fetchParams,
        page: currentPage,
        pageSize: 10,
        userId: user.id,
      })}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        setResources((prevResources) =>
          append ? [...prevResources, ...data.data] : data.data
        );
        setTotalCount(data.totalCount);
        updateResultCount(resourceType, data.totalCount);
        setPage(currentPage);
      } catch (error) {
        console.error(`Error fetching ${resourceType}:`, error);
        setError(`Failed to load ${resourceType}. Please try again.`);
      } finally {
        setIsLoading(false);
      }
    },
    [resourceType, fetchParams, user, updateResultCount]
  );

  useEffect(() => {
    setPage(1);
    fetchResources(1, false);
  }, [fetchParams, resourceType, fetchResources]);

  const handleScroll = useCallback(() => {
    if (feedRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
      if (
        scrollTop + clientHeight >= scrollHeight - 200 &&
        !isLoading &&
        resources.length < totalCount
      ) {
        fetchResources(page + 1, true);
      }
    }
  }, [isLoading, resources.length, totalCount, page, fetchResources]);

  useEffect(() => {
    const feedElement = feedRef.current;
    feedElement?.addEventListener("scroll", handleScroll, { passive: true });
    return () => feedElement?.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const ResourceCard = resourceType === "papers" ? PaperCard : ModelCard;

  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box
      width="100%"
      height={{ base: "calc(200vh - 250px)", md: "calc(200vh - 200px)" }} // Changed 100vh to 200vh
      overflowY="auto"
      ref={feedRef}
      css={{
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-track": { width: "6px" },
        "&::-webkit-scrollbar-thumb": {
          background: "gray.500",
          borderRadius: "24px",
        },
        scrollBehavior: "smooth",
      }}
    >
      {isLoading && resources.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Spinner size="xl" />
          <Text mt={2}>Loading {resourceType}...</Text>
        </Box>
      ) : resources.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Text>No {resourceType} found. Try adjusting your search.</Text>
        </Box>
      ) : (
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
          spacing={6}
          px={{ base: 2, md: 4 }}
        >
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              {...(resourceType === "papers"
                ? { paper: resource }
                : { model: resource })}
              onBookmarkChange={() => toggleBookmark(resource.id, resourceType)}
            />
          ))}
        </SimpleGrid>
      )}
      {isLoading && resources.length > 0 && (
        <Box textAlign="center" py={4}>
          <Spinner />
          <Text mt={2}>Loading more {resourceType}...</Text>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(Feed);
