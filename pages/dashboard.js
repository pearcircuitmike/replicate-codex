import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Heading,
  Text,
  Container,
  Button,
  VStack,
  Link,
  HStack,
} from "@chakra-ui/react";
import UserBookmarks from "../components/UserBookmarks";

const Dashboard = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxW="7xl" py={8}>
      {user ? (
        <Box>
          <Heading as="h1" size="2xl" mb={8}>
            Dashboard
          </Heading>
          <Text fontSize="lg" mb={8}>
            Here you can find your bookmarked papers and models. Click on a card
            to view more details or remove the bookmark.
          </Text>
          <HStack spacing={4} mb={8}>
            <Button colorScheme="blue" onClick={logout}>
              Log Out
            </Button>
            <Link
              href="mailto:mike@replicatecodex.com?subject=Help%20Request"
              isExternal
            >
              <Button colorScheme="yellow">Get Support</Button>
            </Link>
            <Link
              href="mailto:mike@replicatecodex.com?subject=Feedback"
              isExternal
            >
              <Button colorScheme="green">Give Feedback</Button>
            </Link>
            <Link href="https://discord.gg/PKnYe6B4A6" isExternal>
              <Button colorScheme="purple">Join Discord</Button>
            </Link>
          </HStack>
          <VStack spacing={8} align="stretch">
            <Box>
              <UserBookmarks resourceType="paper" />
            </Box>
            <Box>
              <UserBookmarks resourceType="model" />
            </Box>
          </VStack>
        </Box>
      ) : (
        <Text fontSize="xl" mb={8}>
          Please log in to view your dashboard.
        </Text>
      )}
    </Container>
  );
};

export default Dashboard;
