import { useState } from "react";
import {
  Box,
  Button,
  Center,
  Heading,
  VStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaGoogle } from "react-icons/fa";
import supabase from "../utils/supabaseClient";

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleSignInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_BASE_URL}/dashboard`,
      },
    });
    if (error) {
      console.log("Error signing in with Google:", error);
    }
    setLoading(false);
  };

  return (
    <Center h="100vh">
      <Box
        maxW="md"
        w="full"
        bg={useColorModeValue("white", "gray.800")}
        boxShadow="2xl"
        rounded="lg"
        p={6}
        textAlign="center"
      >
        <Heading as="h2" size="xl" fontWeight="bold" mb={6}>
          Sign in to your account
        </Heading>
        <VStack spacing={4}>
          <Text>Sign in or up with your Google account</Text>
          <Button
            colorScheme="blue"
            leftIcon={<FaGoogle />}
            onClick={handleSignInWithGoogle}
            isLoading={loading}
            loadingText="Signing in..."
          >
            Sign in with Google
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}
