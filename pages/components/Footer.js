import { Container, Button } from "@chakra-ui/react";
import { FaTwitter } from "react-icons/fa";
import Link from "next/link";

const Footer = () => {
  return (
    <Container maxW={"5xl"} mb={5} mt={5}>
      <Link href="https://twitter.com/mikeyoung44" passHref>
        <Button colorScheme="twitter" leftIcon={<FaTwitter />}>
          Follow updates on Twitter
        </Button>
      </Link>
    </Container>
  );
};

export default Footer;
