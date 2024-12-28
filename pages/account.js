import React from "react";
import { useAuth } from "../context/AuthContext";
import { Box, Heading, Text, Button, VStack, Link } from "@chakra-ui/react";
import supabase from "./api/utils/supabaseClient";
import DigestPreferences from "../components/DigestPreferences";
import MetaTags from "../components/MetaTags";

const Account = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <MetaTags
        title="My Account"
        description="Manage your AIModels.fyi account settings, preferences, and subscriptions"
        socialPreviewTitle="My Account - AIModels.fyi"
        socialPreviewSubtitle="Manage your account settings and preferences"
      />

      <Box maxW="container.md" mx="auto" py={8}>
        <Heading as="h1" size="2xl" mb={8}>
          My Account
        </Heading>
        <Text fontSize="xl" mb={8}>
          Welcome to your account page. Here you can manage your subscription,
          get support, and provide feedback.
        </Text>

        {/* Digest Preferences Section */}
        <Box mb={8}>
          <Heading as="h2" size="lg" mb={4}>
            Digest Preferences
          </Heading>
          <DigestPreferences user={user} />
        </Box>

        <VStack spacing={6} align="stretch">
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
    </>
  );
};

export default Account;
