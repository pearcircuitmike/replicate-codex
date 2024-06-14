import {
  Box,
  Heading,
  Text,
  Button,
  UnorderedList,
  ListItem,
  Link,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "../context/AuthContext";

const PricingPage = () => {
  const { user } = useAuth();

  const handleSubscription = () => {
    const stripeUrl = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_URL;

    const url = new URL(stripeUrl);
    url.searchParams.append("client_reference_id", user.id);
    window.location.href = url.toString();
  };

  return (
    <Box p={8} maxW="container.md" mx="auto">
      <Heading as="h1" size="xl" mb={8}>
        Finish your signup to unlock all the features of AImodels.fyi
      </Heading>
      <Text fontSize="xl" mb={8}>
        Choose a subscription plan and stay ahead in AI.
      </Text>
      <Text fontSize="xl" mb={4}>
        As a subscriber, you get:
      </Text>
      <UnorderedList mb={8}>
        <ListItem>
          Unlimited access to AI content personalized to your interests
        </ListItem>
        <ListItem>
          Guides to top models, papers, and tools—no PhD required!
        </ListItem>
        <ListItem>
          Exclusive access to the Discord community with AI experts and builders
        </ListItem>
        <ListItem>Bookmark resources for easy reference</ListItem>
        <ListItem>
          Weekly digests of top models and papers based on your interests
        </ListItem>
      </UnorderedList>
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
          Monthly Pro Plan
        </Heading>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          $18/month
        </Text>
        <Button colorScheme="blue" size="lg" onClick={handleSubscription}>
          Subscribe Monthly
        </Button>
      </Box>
      <Text fontSize="lg" mb={8}>
        Join researchers, developers, startup founders, and students in keeping
        up with the latest AI breakthroughs.
      </Text>
      <Box mt={"150px"}>
        <Link as={NextLink} href="/">
          Back to Home
        </Link>
      </Box>
    </Box>
  );
};

export default PricingPage;
