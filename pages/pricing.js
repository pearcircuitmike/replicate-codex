import {
  Box,
  Heading,
  Text,
  Button,
  List,
  ListItem,
  ListIcon,
  Link,
  SimpleGrid,
  Container,
  HStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "../context/AuthContext";
import { FaCheckCircle } from "react-icons/fa";
import { useState } from "react";

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
          <SimpleGrid columns={1} spacing={8}>
            <Box bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Box p={6}>
                <Text fontSize="xl" mb={4}>
                  AImodels.fyi&apos;s summaries are my cheat code. They&apos;ve
                  helped me rapidly parse my options based on new research and
                  then implement them in my code.
                </Text>
                <Box display="flex" alignItems="center">
                  <Box
                    borderRadius="full"
                    width="48px"
                    height="48px"
                    overflow="hidden"
                    mr={4}
                  >
                    <img
                      src="https://media.licdn.com/dms/image/C5603AQFhkTZjZxF6cQ/profile-displayphoto-shrink_100_100/0/1627310111771?e=1720656000&v=beta&t=b-b_lq8TiGtu29b5XVBB2Ohj3GtYIETUylajANz9rFg"
                      alt="Philip"
                    />
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Philip P.</Text>
                    <Text fontSize="sm" color="gray.500">
                      AI Founder
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Box p={6}>
                <Text fontSize="xl" mb={4}>
                  The most comprehensive and meaningful index of AI models that
                  are both emerging and production-ready so I can focus on
                  building without getting left behind.
                </Text>
                <Box display="flex" alignItems="center">
                  <Box
                    borderRadius="full"
                    width="48px"
                    height="48px"
                    overflow="hidden"
                    mr={4}
                  >
                    <img
                      src="https://pbs.twimg.com/profile_images/1967113482/Ink-meNEWa_400x400.png"
                      alt="Andy"
                    />
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Andy M.</Text>
                    <Text fontSize="sm" color="gray.500">
                      Founder, Safemail AI
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Box p={6}>
                <Text fontSize="xl" mb={4}>
                  It makes it easier for us that don&apos;t have the time or
                  ideas to dig deep learn this amazingly fast paced field, and
                  for that we thank you
                </Text>
                <Box display="flex" alignItems="center">
                  <Box
                    borderRadius="full"
                    width="48px"
                    height="48px"
                    overflow="hidden"
                    mr={4}
                  >
                    <img
                      src="https://substackcdn.com/image/fetch/w_88,h_88,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack.com%2Fimg%2Favatars%2Fyellow.png"
                      alt="Anon"
                    />
                  </Box>
                  <Box>
                    <Text fontWeight="bold">The AC guys</Text>
                    <Text fontSize="sm" color="gray.500">
                      Anon.
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Box p={6}>
                <Text fontSize="xl" mb={4}>
                  So many A.I. Newsletters focus on the big-ticket industry news
                  items (e.g. the latest model releases, or which company bought
                  a different company, etc.) But as an actual practitioner and
                  educator in A.I. and NLP, I need a way to keep up to date on
                  the latest{" "}
                  <span style={{ fontWeight: "bold" }}>research</span>.... you
                  do just that!
                </Text>
                <Box display="flex" alignItems="center">
                  <Box
                    borderRadius="full"
                    width="48px"
                    height="48px"
                    overflow="hidden"
                    mr={4}
                  >
                    <img
                      src="https://media.licdn.com/dms/image/C5603AQFAiqtIGY2xnw/profile-displayphoto-shrink_800_800/0/1572043262240?e=1720656000&v=beta&t=boEhSBYDd0qNfWON1I6aNL1x3CMd8YvVHUruX6zEVok"
                      alt="Christian Monson"
                    />
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Christian Monson</Text>
                    <Text fontSize="sm" color="gray.500">
                      Tutor and mentor, A.I., Machine Learning, and NLP
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
          </SimpleGrid>
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
