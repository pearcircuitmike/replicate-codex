import { useAuth } from "../context/AuthContext";
import { Box, Heading, Text, Button, VStack, Link } from "@chakra-ui/react";
import NextLink from "next/link";

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
      <VStack spacing={4} align="Left">
        <Box>
          <Button colorScheme="blue" onClick={logout}>
            Log Out
          </Button>
        </Box>
        <Link
          href="mailto:mike@replicatecodex.com?subject=Help%20Request"
          isExternal
        >
          <Button colorScheme="yellow">Support</Button>
        </Link>
        <Link href="mailto:mike@replicatecodex.com?subject=Feedback" isExternal>
          <Button colorScheme="green">Feedback</Button>
        </Link>
        <NextLink href="https://cnn.com" passHref>
          <Button colorScheme="purple">Manage Subscription</Button>
        </NextLink>
      </VStack>
    </Box>
  );
};

export default Account;
