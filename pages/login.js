// pages/login.js
import { Center, Container, Heading, VStack } from "@chakra-ui/react";
import AuthForm from "../components/AuthForm";
import MetaTags from "@/components/MetaTags";

export default function LoginPage() {
  return (
    <>
      <MetaTags
        title="Sign In"
        description="Sign in or create your AIModels.fyi account"
        socialPreviewTitle="Sign In - AIModels.fyi"
        socialPreviewSubtitle="Access your AI research hub"
      />
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
    </>
  );
}
