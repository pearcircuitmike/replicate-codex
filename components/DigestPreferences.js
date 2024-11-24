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
import supabase from "@/pages/api/utils/supabaseClient";

const DigestPreferences = () => {
  const { accessToken } = useAuth();
  const [papersPreference, setPapersPreference] = useState("weekly");
  const [modelsPreference, setModelsPreference] = useState("weekly");
  const toast = useToast();

  useEffect(() => {
    const fetchPreferences = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("papers_digest_preference, models_digest_preference")
        .single();

      if (data) {
        setPapersPreference(data.papers_digest_preference);
        setModelsPreference(data.models_digest_preference);
      }
    };

    fetchPreferences();
  }, []);

  const handlePreferenceChange = async (type, value) => {
    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          [type]: value,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Preferences updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        if (type === "papers_digest_preference") {
          setPapersPreference(value);
        } else {
          setModelsPreference(value);
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

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Papers Digest Frequency</FormLabel>
          <Select
            value={papersPreference}
            onChange={(e) =>
              handlePreferenceChange("papers_digest_preference", e.target.value)
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
            value={modelsPreference}
            onChange={(e) =>
              handlePreferenceChange("models_digest_preference", e.target.value)
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
