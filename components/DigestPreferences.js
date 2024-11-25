import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Select,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";

const DigestPreferences = () => {
  const { user, accessToken } = useAuth();
  const [papersFrequency, setPapersFrequency] = useState("weekly");
  const [modelsFrequency, setModelsFrequency] = useState("weekly");
  const toast = useToast();

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;

      try {
        const response = await fetch("/api/preferences", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPapersFrequency(data.papers_frequency || "weekly");
          setModelsFrequency(data.models_frequency || "weekly");
        } else {
          const errorData = await response.json();
          console.error("Error fetching preferences:", errorData.error);
        }
      } catch (error) {
        console.error("Error fetching preferences:", error.message);
      }
    };

    fetchPreferences();
  }, [user, accessToken]);

  const handlePreferenceChange = async (field, value) => {
    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ field, value }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Preferences updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        if (field === "papers_frequency") {
          setPapersFrequency(value);
        } else {
          setModelsFrequency(value);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error updating preferences",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!user) return null;

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Papers Digest Frequency</FormLabel>
          <Select
            value={papersFrequency}
            onChange={(e) =>
              handlePreferenceChange("papers_frequency", e.target.value)
            }
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="none">None</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Models Digest Frequency</FormLabel>
          <Select
            value={modelsFrequency}
            onChange={(e) =>
              handlePreferenceChange("models_frequency", e.target.value)
            }
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="none">None</option>
          </Select>
        </FormControl>
      </VStack>
    </Box>
  );
};

export default DigestPreferences;
