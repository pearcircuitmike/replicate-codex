// components/Dashboard/Views/UserHighlights.js

import React, { useState, useEffect, useCallback } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import { useAuth } from "../../../context/AuthContext";
import CommunityHighlightsTab from "../../Community/CommunityHighlightsTab";

const UserHighlights = () => {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHighlights = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/dashboard/highlights?userId=${user.id}`
      );

      if (!response.ok) throw new Error("Failed to fetch highlights");
      const data = await response.json();
      setHighlights(data);
    } catch (err) {
      console.error("Error fetching highlights:", err);
      setError("Failed to load highlights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchHighlights();
    }
  }, [user, fetchHighlights]);

  if (isLoading) {
    return <Text>Loading highlights...</Text>;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  return (
    <Box mt={8}>
      <Heading as="h2" size="lg" mb={4}>
        My Highlights
      </Heading>
      <CommunityHighlightsTab highlights={highlights} />
    </Box>
  );
};

export default UserHighlights;
