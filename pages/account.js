import React from "react";
import { useAuth } from "../context/AuthContext";
import { Box, Heading, Text, Button, VStack, Link } from "@chakra-ui/react";
import supabase from "./api/utils/supabaseClient";

const Account = () => {
  const { user, logout } = useAuth();

  return (
    <Box maxW="container.md" mx="auto" py={8}>
      <Heading as="h1" size="2xl" mb={8}>
        My Account
      </Heading>
      <Text fontSize="xl" mb={8}>
        Welcome to your account page. Here you can manage your subscription, get
        support, and provide feedback.
      </Text>
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
  );
};

export default Account;
