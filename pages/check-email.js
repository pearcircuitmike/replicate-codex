// pages/check-email.js
import { Box, Center, Heading, Text } from "@chakra-ui/react";

export default function CheckEmail() {
  return (
    <Center h="100vh">
      <Box textAlign="center">
        <Heading as="h2" size="xl" fontWeight="bold" mb={6}>
          Check your email
        </Heading>
        <Text>
          A confirmation email has been sent to your email address. Please click
          on the confirmation link in the email to verify your account.
        </Text>
      </Box>
    </Center>
  );
}
