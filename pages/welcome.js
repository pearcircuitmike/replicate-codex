import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Box, Button, Center, Heading, Text, useToast } from "@chakra-ui/react";
import supabase from "../pages/api/utils/supabaseClient";
import { useRouter } from "next/router";

const WelcomePage = () => {
  const { user, firstTimeUser } = useAuth();
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(firstTimeUser);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!user) {
      router.push("/login").catch((error) => {
        console.error("Redirect to login failed:", error);
      });
    } else if (!isFirstTimeUser) {
      router.push("/dashboard").catch((error) => {
        console.error("Redirect to dashboard failed:", error);
      });
    }
  }, [user, isFirstTimeUser, router]);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ first_login: false })
        .eq("id", user.id);

      if (error) throw error;

      setIsFirstTimeUser(false);

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
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !isFirstTimeUser) {
    return null; // Optionally, display a loading spinner
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
        <Button
          colorScheme="blue"
          onClick={handleContinue}
          isLoading={isLoading}
          loadingText="Setting up..."
        >
          Continue to Dashboard
        </Button>
      </Box>
    </Center>
  );
};

export default WelcomePage;
