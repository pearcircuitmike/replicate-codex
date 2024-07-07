import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Link,
  Select,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import supabase from "./api/utils/supabaseClient";

const Account = () => {
  const { user, logout } = useAuth();
  const [papersDigestPreference, setPapersDigestPreference] = useState("");
  const [modelsDigestPreference, setModelsDigestPreference] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPreferences();
    }
  }, [user]);

  const fetchUserPreferences = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("papers_digest_preference, models_digest_preference")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setPapersDigestPreference(data.papers_digest_preference || "");
      setModelsDigestPreference(data.models_digest_preference || "");
    } catch (error) {
      console.error("Error fetching user preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = async (type, value) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ [type]: value })
        .eq("id", user.id);

      if (error) throw error;

      if (type === "papers_digest_preference") {
        setPapersDigestPreference(value);
      } else if (type === "models_digest_preference") {
        setModelsDigestPreference(value);
      }
    } catch (error) {
      console.error("Error updating preference:", error);
      // Optionally, show an error message to the user
    }
  };

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box maxW="container.md" mx="auto" py={8}>
      <Heading as="h1" size="2xl" mb={8}>
        My Account
      </Heading>
      <Text fontSize="xl" mb={8}>
        Welcome to your account page. Here you can manage your subscription, set
        your digest preferences, get support, and provide feedback.
      </Text>
      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel>Papers Digest Preference</FormLabel>
          <Select
            value={papersDigestPreference}
            onChange={(e) =>
              handlePreferenceChange("papers_digest_preference", e.target.value)
            }
          >
            <option value="none">Do not send</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Models Digest Preference</FormLabel>
          <Select
            value={modelsDigestPreference}
            onChange={(e) =>
              handlePreferenceChange("models_digest_preference", e.target.value)
            }
          >
            <option value="none">Do not send</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </FormControl>
        <Box>
          <Button colorScheme="blue" onClick={logout}>
            Log Out
          </Button>
        </Box>
        <Box>
          <Link
            href="mailto:mike@replicatecodex.com?subject=Help%20Request"
            isExternal
          >
            <Button colorScheme="yellow">Support</Button>
          </Link>
        </Box>
        <Box>
          <Link
            href="mailto:mike@replicatecodex.com?subject=Feedback"
            isExternal
          >
            <Button colorScheme="green">Feedback</Button>
          </Link>
        </Box>
        <Box>
          <Link
            href={process.env.NEXT_PUBLIC_STRIPE_MANAGE_SUBSCRIPTION_URL}
            isExternal
          >
            <Button colorScheme="purple">Manage Subscription</Button>
          </Link>
        </Box>
      </VStack>
    </Box>
  );
};

export default Account;
