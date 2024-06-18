// pages/confirm-email.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Center,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import supabase from "../utils/supabaseClient";

export default function ConfirmEmail() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    const confirmEmail = async () => {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: router.query.token_hash,
        type: "email",
      });

      if (error) {
        setError(error.message);
      } else {
        // Email confirmed successfully, redirect to the dashboard or login page
        router.push("/dashboard"); // or "/login"
      }
    };

    if (router.query.token_hash) {
      confirmEmail();
    }
  }, [router.query.token_hash]);

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
          Email Confirmation
        </Heading>
        {error ? (
          <Text color="red.500">{error}</Text>
        ) : (
          <Text>Confirming your email...</Text>
        )}
      </Box>
    </Center>
  );
}
