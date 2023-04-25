import { Container, Button } from "@chakra-ui/react";
import { FaTwitter } from "react-icons/fa";
import Link from "next/link";
import NewsletterSubscription from "./NewsletterSubscription";

const Footer = () => {
  return (
    <Container maxW={"5xl"} mb={5} mt={10}>
      <NewsletterSubscription />
    </Container>
  );
};

export default Footer;
