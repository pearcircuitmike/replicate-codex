// pages/login.js
import { Center, Container, Heading, VStack } from "@chakra-ui/react";
import AuthForm from "../components/AuthForm";

export default function LoginPage() {
  return (
    <Container>
      <VStack>
        <Heading mt={4} as="h2">
          Sign in or sign up
        </Heading>
        <Center h="50vh">
          <AuthForm signupSource="login-page" />
        </Center>
      </VStack>
    </Container>
  );
}
