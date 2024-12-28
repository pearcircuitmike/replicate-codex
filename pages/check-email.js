import { Box, Center, Heading, Text } from "@chakra-ui/react";
import MetaTags from "../components/MetaTags";

export default function CheckEmail() {
  return (
    <>
      <MetaTags
        title="Check your email"
        description="Please check your email to verify your AIModels.fyi account"
        socialPreviewTitle="Check your email - AIModels.fyi"
        socialPreviewSubtitle="Verify your email address to continue"
      />

      <Center h="100vh">
        <Box textAlign="center">
          <Heading as="h2" size="xl" fontWeight="bold" mb={6}>
            Check your email
          </Heading>
          <Text>
            A confirmation email has been sent to your email address. Please
            click on the confirmation link in the email to verify your account.
          </Text>
        </Box>
      </Center>
    </>
  );
}
