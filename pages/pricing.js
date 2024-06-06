import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  Link,
  UnorderedList,
  ListItem,
  Switch,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const PricingPage = () => {
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(false);

  const handleSubscription = () => {
    const stripeUrl = new URL(
      isYearly
        ? "https://buy.stripe.com/test_bIY6qba7Aacz7bq001"
        : "https://buy.stripe.com/test_4gw7ufdjM2K7anC4gg"
    );
    stripeUrl.searchParams.append("client_reference_id", user.id);
    window.location.href = stripeUrl.toString();
  };

  return (
    <Box p={8} maxW="container.md" mx="auto">
      <Heading as="h1" size="xl" mb={8}>
        One Last Step to Complete Your Signup
      </Heading>
      <Text fontSize="xl" mb={8}>
        Choose a subscription plan to unlock the full potential of AImodels.fyi
        and stay ahead of the AI curve.
      </Text>
      <Text fontSize="xl" mb={4}>
        As a subscriber, you'll get access to:
      </Text>
      <UnorderedList mb={8}>
        <ListItem>
          Unlimited access to all AI content, personalized to your interests
        </ListItem>
        <ListItem>
          Guides to the top models, papers, and tools - no PhD required!
        </ListItem>
        <ListItem>
          Exclusive access to the Discord community with AI experts and builders
        </ListItem>
        <ListItem>Bookmark articles for easy reference</ListItem>
        <ListItem>Custom feed based on your preferred categories</ListItem>
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
          {isYearly ? "Yearly Pro Plan" : "Monthly Pro Plan"}
        </Heading>
        <Stack direction="row" justify="center" align="center" mb={4}>
          <Text fontSize="xl" fontWeight="bold">
            Monthly
          </Text>
          <Switch
            size="lg"
            colorScheme="green"
            isChecked={isYearly}
            onChange={() => setIsYearly(!isYearly)}
          />
          <Text fontSize="xl" fontWeight="bold">
            Yearly
          </Text>
        </Stack>
        {isYearly ? (
          <>
            <Text fontSize="xl" fontWeight="bold" mb={2}>
              <Text as="s" color="gray.500">
                $180/year
              </Text>
            </Text>
            <Text fontSize="2xl" fontWeight="bold" mb={4} color="green.500">
              $90/year
            </Text>
          </>
        ) : (
          <>
            <Text fontSize="xl" fontWeight="bold" mb={2}>
              <Text as="s" color="gray.500">
                $18/month
              </Text>
            </Text>
            <Text fontSize="2xl" fontWeight="bold" mb={4} color="green.500">
              $9/month
            </Text>
          </>
        )}
        <Button
          colorScheme={isYearly ? "green" : "blue"}
          size="lg"
          onClick={handleSubscription}
        >
          {isYearly ? "Subscribe Yearly" : "Subscribe Monthly"}
        </Button>
      </Box>
      <Text fontSize="lg" mb={8}>
        Join researchers, academics, software developers, startup founders, and
        grad students working with AI in staying up-to-date with the latest
        breakthroughs that matter.
      </Text>
      <Link as={NextLink} href="/" mt={8}>
        Back to Home
      </Link>
    </Box>
  );
};

export default PricingPage;
