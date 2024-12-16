import { useState } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  useColorModeValue,
  Input,
  FormControl,
  FormErrorMessage,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function AuthForm({
  isUpgradeFlow = false,
  signupSource = "default",
}) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { handleSignInWithGoogle, handleSignInWithEmail } = useAuth();

  const signInWithGoogle = async () => {
    setLoading(true);
    localStorage.setItem("signupSource", signupSource);
    await handleSignInWithGoogle();
    setLoading(false);
  };

  const signInWithEmail = async (e) => {
    e.preventDefault();

    if (!email) {
      setEmailError("Email is required");
      return;
    }

    setLoading(true);
    localStorage.setItem("signupSource", signupSource);

    const { data, error } = await handleSignInWithEmail(email);
    if (!error) {
      setEmailSent(true);
      setEmailError(""); // Clear the error on successful submission
      onOpen();
    }
    setLoading(false);
  };

  const closeModal = () => {
    onClose();
  };

  const copyVariants = {
    default: {
      button: "Go to my dashboard →",
      loadingText: "Sending magic link...",
      googleText: "Sign in with Google",
      existingAccount: "If you already have an account, we'll log you in",
      modalHeader: "Check your inbox",
      modalBody:
        "A magic link has been sent to your email. Click the link to log in.",
      emailPlaceholder: "Type your email...",
    },
    upgrade: {
      button: "Start Free Trial →",
      loadingText: "Setting up your trial...",
      googleText: "Continue with Google",
      existingAccount: "Have an account? We'll apply the trial to it",
      modalHeader: "Check your inbox to start your trial",
      modalBody:
        "We've sent you a magic link. Click it to activate your 7-day free trial.",
      emailPlaceholder: "Enter your email...",
    },
  };

  const copy = isUpgradeFlow ? copyVariants.upgrade : copyVariants.default;

  return (
    <>
      <Box
        as="form"
        onSubmit={signInWithEmail}
        maxW="md"
        w="full"
        bg={useColorModeValue("white", "gray.800")}
        boxShadow="base"
        rounded="md"
        px={5}
        py={3}
        textAlign="center"
        position="relative"
      >
        <VStack spacing={4}>
          <FormControl id="email" isInvalid={Boolean(emailError)}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={copy.emailPlaceholder}
            />
            <FormErrorMessage>{emailError}</FormErrorMessage>
            {emailSent && (
              <Text fontWeight="bold" color="red.500" mt={2}>
                Check your email for the magic link!
              </Text>
            )}
          </FormControl>
          <Button
            type="submit"
            bg={isUpgradeFlow ? "green.500" : ""}
            bgGradient={!isUpgradeFlow ? "linear(to-tr, #3182CE,#38A169)" : ""}
            _hover={{
              bgGradient: !isUpgradeFlow
                ? "linear(to-tr, #2B6CB0,#2F855A)"
                : "",
              bg: isUpgradeFlow ? "green.600" : "",
            }}
            _active={{
              bgGradient: !isUpgradeFlow
                ? "linear(to-tr, #2C5282,#276749)"
                : "",
              bg: isUpgradeFlow ? "green.700" : "",
            }}
            color="white"
            isLoading={loading}
            loadingText={copy.loadingText}
            width="100%"
          >
            {copy.button}
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
            onClick={signInWithGoogle}
            isLoading={loading}
            width="100%"
            loadingText={copy.loadingText}
            color="black.500"
          >
            <Text fontSize="sm">{copy.googleText}</Text>
          </Button>
          <Text fontSize="xs" color="gray.500">
            {copy.existingAccount}
          </Text>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{copy.modalHeader}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="lg" mb={4}>
              {copy.modalBody}
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
