import { useAuth } from "../context/AuthContext";
import { Box, Button, Center, Heading, Text } from "@chakra-ui/react";
import supabase from "@/utils/supabaseClient";

const WelcomePage = () => {
  const { user, setFirstTimeUser } = useAuth();

  const handleContinue = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ first_login: false })
      .eq("id", user.id);

    if (!error) {
      setFirstTimeUser(false); // Manually update the context to reflect the change immediately
    } else {
      console.error("Failed to update first login status:", error.message);
    }
  };

  return (
    <Center h="100vh">
      <Box textAlign="center">
        <Heading as="h1" size="2xl" mb={6}>
          Welcome, {user?.email}!
        </Heading>
        <Text fontSize="xl" mb={8}>
          Thank you for signing up. You can now access the Dashboard.
        </Text>
        <Button colorScheme="blue" onClick={handleContinue}>
          Continue
        </Button>
      </Box>
    </Center>
  );
};

export default WelcomePage;
