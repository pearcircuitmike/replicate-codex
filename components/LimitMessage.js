import { Box, Text, Center, Container } from "@chakra-ui/react";
import AuthForm from "./AuthForm";

const LimitMessage = () => {
  return (
    <Container maxW="container.md">
      <Box mt={8}>
        <Text fontWeight="bold" fontSize="lg" align="center">
          You reached the limit of 5 free paper summaries for the month. Become
          a paid subscriber to get unlimited access.
        </Text>
      </Box>
      <Center my="20px">
        <AuthForm />
      </Center>
    </Container>
  );
};

export default LimitMessage;
