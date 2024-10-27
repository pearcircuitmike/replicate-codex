import { Container, Box, Text } from "@chakra-ui/react";
import { FaTwitter } from "react-icons/fa";
import Link from "next/link";

const Footer = () => {
  return (
    <Container maxW="5xl" mb={5} mt={10}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Link href="/privacy" passHref>
          <Text fontSize="sm" mr={4}>
            Our Privacy Policy
          </Text>
        </Link>
        <Link href="/tos" passHref>
          <Text fontSize="sm">Terms of Service</Text>
        </Link>
      </Box>
    </Container>
  );
};

export default Footer;
