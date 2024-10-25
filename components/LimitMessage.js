import React from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  List,
  ListItem,
  ListIcon,
  Container,
  HStack,
  Badge,
  Flex,
  useBreakpointValue,
  Divider,
} from "@chakra-ui/react";
import {
  FaCheckCircle,
  FaLightbulb,
  FaTrendingUp,
  FaDiscord,
} from "react-icons/fa";
import AuthForm from "./AuthForm";
import Testimonials from "./Testimonials";

const LimitMessage = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Container maxW="container.xl" py={8}>
      <Flex
        direction={isMobile ? "column" : "row"}
        gap={8}
        justify="center"
        align="start"
      >
        <VStack spacing={8} maxW="500px" width="full">
          {/* Warm, personalized greeting */}
          <Box textAlign="center">
            <Badge colorScheme="purple" mb={4} fontSize="sm" px={3} py={1}>
              Research Enthusiast
            </Badge>
            <Heading size="lg" mb={4} color="gray.800">
              You're really diving deep into AI research!
            </Heading>
            <Text fontSize="lg" color="gray.600">
              You've read 5 detailed paper summaries this month – looks like
              you're as passionate about AI advancement as we are.
            </Text>
          </Box>

          {/* Value Proposition with emotional appeal */}
          <Box
            width="full"
            bg="white"
            p={8}
            borderRadius="xl"
            borderWidth={1}
            boxShadow="lg"
          >
            <VStack align="start" spacing={6}>
              <Text fontSize="lg" fontWeight="medium" color="purple.700">
                Ready to take your AI research to the next level?
              </Text>

              <Box width="full">
                <Text fontSize="md" color="gray.700" mb={4}>
                  Join thousands of AI professionals who get:
                </Text>
                <List spacing={4}>
                  <ListItem display="flex" alignItems="center">
                    <ListIcon
                      as={FaTrendingUp}
                      color="green.500"
                      fontSize="20px"
                    />
                    <Box>
                      <Text fontWeight="medium">
                        Publication Trends & Insights
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Stay ahead of the curve with real-time research trends
                      </Text>
                    </Box>
                  </ListItem>
                  <ListItem display="flex" alignItems="center">
                    <ListIcon
                      as={FaLightbulb}
                      color="green.500"
                      fontSize="20px"
                    />
                    <Box>
                      <Text fontWeight="medium">Unlimited Paper Summaries</Text>
                      <Text fontSize="sm" color="gray.600">
                        Deep dive into any paper that catches your interest
                      </Text>
                    </Box>
                  </ListItem>
                  <ListItem display="flex" alignItems="center">
                    <ListIcon
                      as={FaDiscord}
                      color="green.500"
                      fontSize="20px"
                    />
                    <Box>
                      <Text fontWeight="medium">
                        Exclusive AI Research Community
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Connect with fellow researchers in our Discord
                      </Text>
                    </Box>
                  </ListItem>
                </List>
              </Box>

              <Divider />

              {/* Clear value messaging before CTA */}
              <Box bg="purple.50" p={6} borderRadius="lg" width="full">
                <Text
                  fontSize="md"
                  fontWeight="medium"
                  color="purple.700"
                  mb={4}
                  textAlign="center"
                >
                  Try everything free for 7 days
                </Text>
                <AuthForm />
                <Text fontSize="sm" color="gray.600" textAlign="center" mt={4}>
                  Start your free week • Cancel anytime before trial ends
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>

        {/* Social proof section */}
        {!isMobile && (
          <Box maxW="400px" width="full" mt={8}>
            <Heading
              as="h2"
              fontSize="xl"
              mb={6}
              textAlign="center"
              color="gray.700"
            >
              Join Fellow AI Researchers
            </Heading>
            <Testimonials />
            <Text fontSize="sm" color="gray.500" textAlign="center" mt={6}>
              Trusted by researchers from OpenAI, Anthropic, and leading AI labs
            </Text>
          </Box>
        )}
      </Flex>
    </Container>
  );
};

export default LimitMessage;
