import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Box, Button, Center, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import MetaTags from "../components/MetaTags";

const WelcomePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login").catch((error) => {
        console.error("Redirect to login failed:", error);
      });
    }
  }, [user, loading, router]);

  const handleContinue = () => {
    router.push("/dashboard").catch((navError) => {
      console.error("Navigation error:", navError);
    });
  };

  // Include MetaTags even during loading state
  return (
    <>
      <MetaTags
        title="Welcome to AIModels.fyi"
        description="Welcome to your AIModels.fyi account"
        socialPreviewTitle="Welcome - AIModels.fyi"
        socialPreviewSubtitle="Get started with AIModels.fyi"
      />

      {loading ? null : (
        <Center h="100vh">
          <Box textAlign="center">
            <Heading as="h1" size="2xl" mb={6}>
              Welcome, {user?.email}!
            </Heading>
            <Text fontSize="xl" mb={8}>
              Thank you for signing up. You can now access the Dashboard.
            </Text>
            <Button colorScheme="blue" onClick={handleContinue}>
              Go to Dashboard
            </Button>
          </Box>
        </Center>
      )}
    </>
  );
};

export default WelcomePage;
