import React, { useState } from "react";
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
  keyframes,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "../context/AuthContext";
import { FaCheckCircle } from "react-icons/fa";
import Testimonials from "../components/Testimonials";
import { trackEvent } from "../pages/api/utils/analytics-util";

const shine = keyframes`
  0% { left: -400%; }
  100% { left: 400%; }
`;

const PricingPage = () => {
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const price = isYearly ? 8 : 9;
  const billingPeriod = isYearly ? "mo" : "month";
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleSubscription = () => {
    const stripeUrl = isYearly
      ? process.env.NEXT_PUBLIC_STRIPE_YEARLY_URL
      : process.env.NEXT_PUBLIC_STRIPE_MONTHLY_URL;

    const url = new URL(stripeUrl);
    const clientId = user?.id || "null";
    url.searchParams.append("client_reference_id", clientId);

    trackEvent("subscription_initiated", {
      plan_type: isYearly ? "yearly" : "monthly",
      price: price,
      user_id: user?.id,
    });

    window.location.href = url.toString();
  };

  const PricingContent = () => (
    <Box width="100%" maxW="500px" mx="auto">
      <Heading size="xl" mb={6} textAlign="center">
        Complete signup to access your dashboard
      </Heading>

      <HStack justify="center" mb={4}>
        <Button
          onClick={() => setIsYearly(false)}
          bg={!isYearly ? "white" : "gray.100"}
          color={!isYearly ? "gray.800" : "gray.500"}
          border="1px solid"
          borderColor={!isYearly ? "gray.200" : "transparent"}
          _hover={{ bg: !isYearly ? "white" : "gray.200" }}
          borderRadius="md"
          px={6}
          py={2}
          fontWeight={!isYearly ? "semibold" : "normal"}
        >
          🔥 Monthly (Most Popular)
        </Button>
        <Button
          onClick={() => setIsYearly(true)}
          bg={isYearly ? "white" : "gray.100"}
          color={isYearly ? "gray.800" : "gray.500"}
          border="1px solid"
          borderColor={isYearly ? "gray.200" : "transparent"}
          _hover={{ bg: isYearly ? "white" : "gray.200" }}
          borderRadius="md"
          px={6}
          py={2}
          fontWeight={isYearly ? "semibold" : "normal"}
        >
          Yearly
        </Button>
      </HStack>

      <Box
        as={Link}
        onClick={handleSubscription}
        cursor="pointer"
        _hover={{ textDecoration: "none" }}
        display="block"
      >
        <Box
          p={6}
          borderWidth={1}
          borderRadius="lg"
          boxShadow="md"
          textAlign="center"
          mb={8}
          transition="all 0.2s"
          _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
        >
          <Heading as="h2" size="lg" mb={4}>
            Pro Plan
          </Heading>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            ${price}/{billingPeriod}
          </Text>
          {isYearly && (
            <Text fontSize="sm" mb={4} color="gray.500">
              (2 months free, billed yearly $97)
            </Text>
          )}
          <Button
            position="relative"
            colorScheme="blue"
            size="lg"
            overflow="hidden"
            onClick={(e) => {
              e.stopPropagation();
              handleSubscription();
            }}
            _before={{
              content: "''",
              position: "absolute",
              top: "-50%",
              left: "-50%",
              right: "-50%",
              bottom: "-50%",
              background:
                "linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)",
              transform: "rotate(45deg)",
              animation: `${shine} 6s infinite`,
            }}
          >
            Start 7-day free trial
          </Button>
          <List spacing={4} textAlign="left" mt={8} mx={4}>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.500" />
              Bookmark resources for easy reference
            </ListItem>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.500" />
              See publication trends
            </ListItem>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.500" />
              See the most-read papers
            </ListItem>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.500" />
              See what other users are searching for
            </ListItem>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.500" />
              Read unlimited summaries
            </ListItem>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.500" />
              Join the Discord
            </ListItem>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.500" />
              Get weekly digests of top models and papers
            </ListItem>
          </List>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Container
      maxW="container.xl"
      h="100vh"
      py={8}
      display="flex"
      flexDirection="column"
    >
      <Flex
        flex="1"
        direction={isMobile ? "column" : "row"}
        justify="center"
        align="center"
        spacing={8}
      >
        <Box
          width={isMobile ? "100%" : "50%"}
          pr={isMobile ? 0 : 4}
          mb={isMobile ? 8 : 0}
        >
          <PricingContent />
        </Box>
        <Box
          width={isMobile ? "100%" : "50%"}
          pl={isMobile ? 0 : 4}
          maxW="500px"
          mx="auto"
        >
          <Heading as="h2" fontSize="3xl" mb={4} textAlign="center">
            What our subscribers say
          </Heading>
          <Testimonials />
        </Box>
      </Flex>
      <Box mt={10} textAlign="center">
        <Link as={NextLink} href="/">
          Back to Home
        </Link>
      </Box>
    </Container>
  );
};

export default PricingPage;
