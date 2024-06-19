import {
  Box,
  Heading,
  Text,
  Button,
  List,
  ListItem,
  ListIcon,
  Link,
  Container,
  HStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "../context/AuthContext";
import { FaCheckCircle } from "react-icons/fa";
import { useState } from "react";
import Testimonials from "../components/Testimonials";

const PricingPage = () => {
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const price = isYearly ? 8 : 9;
  const billingPeriod = isYearly ? "mo" : "month";

  const handleSubscription = () => {
    const stripeUrl = isYearly
      ? process.env.NEXT_PUBLIC_STRIPE_YEARLY_URL
      : process.env.NEXT_PUBLIC_STRIPE_MONTHLY_URL;

    const url = new URL(stripeUrl);
    url.searchParams.append("client_reference_id", user.id);
    window.location.href = url.toString();
  };

  return (
    <Box p={8} maxW="container.lg" mx="auto">
      <Box textAlign="center" mb={8}>
        <Heading my={"45px"} size="lg">
          Finish setting up your account
        </Heading>
        <HStack justify="center" mb={4}>
          <Button
            onClick={() => setIsYearly(false)}
            colorScheme={isYearly ? "gray" : "blue"}
            variant={isYearly ? "outline" : "solid"}
          >
            Monthly
          </Button>
          <Button
            onClick={() => setIsYearly(true)}
            colorScheme={isYearly ? "blue" : "gray"}
            variant={isYearly ? "solid" : "outline"}
          >
            🔥 Yearly: Get 2 months free
          </Button>
        </HStack>
      </Box>
      <Box
        p={6}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="md"
        textAlign="center"
        mb={8}
        maxW="md"
        mx="auto"
      >
        <Heading as="h2" size="lg" mb={4}>
          Pro Plan
        </Heading>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          ${price}/{billingPeriod}
        </Text>
        {isYearly && (
          <Text fontSize="lg" mb={4}>
            2 months free, billed yearly $97
          </Text>
        )}
        <Button colorScheme="blue" size="lg" onClick={handleSubscription}>
          Subscribe
        </Button>
        <List spacing={4} textAlign="left" mt={8}>
          <ListItem>
            <ListIcon as={FaCheckCircle} color="green.500" />
            Bookmark resources for easy reference
          </ListItem>
          <ListItem>
            <ListIcon as={FaCheckCircle} color="green.500" />
            Unlimited paper summaries
          </ListItem>
          <ListItem>
            <ListIcon as={FaCheckCircle} color="green.500" />
            Unlimited model guides
          </ListItem>
          <ListItem>
            <ListIcon as={FaCheckCircle} color="green.500" />
            Join the Discord community with AI experts
          </ListItem>
          <ListItem>
            <ListIcon as={FaCheckCircle} color="green.500" />
            Weekly digests of top models and papers
          </ListItem>
        </List>
      </Box>
      <Box py={16} px={8}>
        <Container maxW="8xl">
          <Heading as="h2" fontSize="4xl" mt="50px" mb={4} textAlign="center">
            What our users say
          </Heading>
          <Testimonials />
        </Container>
      </Box>
      <Box mt={"150px"} textAlign="center">
        <Link as={NextLink} href="/">
          Back to Home
        </Link>
      </Box>
    </Box>
  );
};

export default PricingPage;
