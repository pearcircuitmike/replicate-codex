import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Center,
  Heading,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import supabase from "./api/utils/supabaseClient";
import MetaTags from "../components/MetaTags";

export default function ConfirmEmail() {
  const router = useRouter();
  const toast = useToast();

  const [tokenHash, setTokenHash] = useState("");
  const [verificationType, setVerificationType] = useState("email");
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Click the button to confirm.");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (router.query.token_hash) {
      setTokenHash(router.query.token_hash);
    }
    if (router.query.type) {
      // e.g. "magiclink" or "signup"
      setVerificationType(router.query.type);
    }
  }, [router.query]);

  const handleConfirm = async () => {
    // If no token is found, show an error
    if (!tokenHash) {
      setError("No token found in the URL.");
      return;
    }

    // Prevent multiple clicks
    if (isVerifying) return;

    setIsVerifying(true);
    setStatus("Verifying...");
    setError(null);

    // Call verifyOtp with the token_hash
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: verificationType,
      // "email", "magiclink", or "signup"—depending on your flow
    });

    if (error) {
      // If token is expired or invalid, show error
      setError(error.message);
      setStatus("");
      setIsVerifying(false);
      return;
    }

    // Success—show toast, then redirect
    toast({
      title: "Success",
      description: "Your email is confirmed.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    setStatus("Success! Redirecting...");
    router.push("/dashboard");
  };

  return (
    <>
      <MetaTags
        title="Confirm your email"
        description="Confirm your email address for your AIModels.fyi account"
        socialPreviewTitle="Confirm Email - AIModels.fyi"
        socialPreviewSubtitle="Complete your email verification"
      />

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
          {error && (
            <Text color="red.500" mb={4}>
              {error}
            </Text>
          )}
          <Text mb={6}>{status}</Text>
          <Button
            onClick={handleConfirm}
            colorScheme="blue"
            isDisabled={!tokenHash || isVerifying}
          >
            Confirm
          </Button>
        </Box>
      </Center>
    </>
  );
}
