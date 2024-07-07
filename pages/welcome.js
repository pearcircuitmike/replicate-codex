import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Box, Button, Center, Heading, Text, useToast } from "@chakra-ui/react";
import supabase from "../pages/api/utils/supabaseClient";
import { useRouter } from "next/router";

const WelcomePage = () => {
  const { user, firstTimeUser, setFirstTimeUser } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!user || !firstTimeUser) {
      router.push("/dashboard");
    }
  }, [user, firstTimeUser, router]);

  const handleContinue = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ first_login: false })
        .eq("id", user.id);

      if (error) throw error;

      setFirstTimeUser(false);
      router.push("/dashboard");
      toast({
        title: "Welcome!",
        description: "Your account is now set up.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to update first login status:", error.message);
      toast({
        title: "An error occurred",
        description: "Unable to complete setup. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!user || !firstTimeUser) {
    return null; // or a loading spinner
  }

  return (
    <Center h="100vh">
      <Box textAlign="center">
        <Heading as="h1" size="2xl" mb={6}>
          Welcome, {user.email}!
        </Heading>
        <Text fontSize="xl" mb={8}>
          Thank you for signing up. You can now access the Dashboard.
        </Text>
        <Button colorScheme="blue" onClick={handleContinue}>
          Continue to Dashboard
        </Button>
      </Box>
    </Center>
  );
};

export default WelcomePage;
