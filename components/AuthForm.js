// components/AuthForm.js
import { useState } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  useColorModeValue,
  Input,
  FormControl,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { FaGoogle } from "react-icons/fa";
import supabase from "../utils/supabaseClient";

export default function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

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

  const handleSignInWithEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_BASE_URL}/dashboard`,
      },
    });
    if (error) {
      console.log("Error signing in with email:", error);
    } else {
      console.log("Magic link sent to your email!");
      setEmailSent(true);
    }
    setLoading(false);
  };

  const closeModal = () => {
    setEmailSent(false);
  };

  return (
    <>
      <Box
        as="form"
        onSubmit={handleSignInWithEmail}
        maxW="md"
        w="full"
        bg={useColorModeValue("white", "gray.800")}
        boxShadow="2xl"
        rounded="lg"
        p={6}
        textAlign="center"
        position="relative"
      >
        <VStack spacing={4}>
          <FormControl id="email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Type your email..."
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText="Sending magic link..."
            width="100%"
          >
            Go to my dashboard →
          </Button>
          <Box position="relative" width="100%">
            <Text
              fontSize="sm"
              color="gray.500"
              zIndex="1"
              backgroundColor={useColorModeValue("white", "gray.800")}
              px={2}
            >
              or
            </Text>
            <Box
              position="absolute"
              width="calc(50% - 10px)"
              height="1px"
              bgColor="gray.500"
              top="50%"
              left="0"
            />
            <Box
              position="absolute"
              width="calc(50% - 10px)"
              height="1px"
              bgColor="gray.500"
              top="50%"
              right="0"
            />
          </Box>
          <Button
            type="button"
            leftIcon={<FaGoogle />}
            onClick={handleSignInWithGoogle}
            isLoading={loading}
            width="100%"
            loadingText="Signing in..."
            color="black.500"
          >
            <Text fontSize="sm">Sign in with Google</Text>
          </Button>
          <Text fontSize="xs" color="gray.500">
            If you already have an account, we'll log you in
          </Text>
        </VStack>
      </Box>

      <Modal isOpen={emailSent} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Check your inbox</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="lg" mb={4}>
              A magic link has been sent to your email. Click the link to log
              in.
            </Text>
            <Button colorScheme="blue" onClick={closeModal}>
              Close
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
