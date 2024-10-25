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
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaLightbulb, FaTrendingUp, FaDiscord } from "react-icons/fa";
import AuthForm from "./AuthForm";
import Testimonials from "./Testimonials";

const FeatureItem = ({ icon, title, description }) => (
  <ListItem display="flex" alignItems="start" gap={3} p={4}>
    <ListIcon as={icon} color="blue.500" fontSize="24px" mt={1} />
    <Box>
      <Text fontWeight="semibold" mb={1}>
        {title}
      </Text>
      <Text fontSize="sm" color="gray.600">
        {description}
      </Text>
    </Box>
  </ListItem>
);

const LimitMessage = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const highlightBg = useColorModeValue("blue.50", "blue.900");

  const features = [
    {
      icon: FaTrendingUp,
      title: "Access Every Trending AI Paper",
      description: "See what top AI labs are publishing in real-time",
    },
    {
      icon: FaLightbulb,
      title: "Save Hours Reading Papers",
      description: "Get the key insights from any paper in 5 minutes or less",
    },
    {
      icon: FaDiscord,
      title: "Discuss With 2000+ AI Researchers",
      description: "Join private discussions about the latest breakthroughs",
    },
  ];

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} width="full">
        {/* Main Heading */}
        <Box textAlign="center" width="full">
          <Heading
            size="lg"
            mb={3}
            color={useColorModeValue("gray.800", "white")}
          >
            Keep Reading AI Papers
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="md" mx="auto">
            Join thousands of AI researchers who get unlimited paper summaries
          </Text>
        </Box>

        {/* Value Proposition */}
        <Box
          width="xl"
          bg={bgColor}
          borderRadius="xl"
          borderWidth={1}
          borderColor={borderColor}
          boxShadow="lg"
          overflow="hidden"
        >
          <List width="full" spacing={0} p={4} divider={<Divider />}>
            {features.map((feature, index) => (
              <FeatureItem key={index} {...feature} />
            ))}
          </List>

          {/* Auth Form Section */}
          <Box bg={highlightBg} p={8}>
            <VStack spacing={6}>
              <Box textAlign="center">
                <Text fontSize="lg" fontWeight="bold" color="gray.900" mb={1}>
                  Try it for free for 7 days
                </Text>
                <Text fontSize="md" color="gray.600">
                  $9/month after trial • Cancel any time
                </Text>
              </Box>

              <AuthForm isUpgradeFlow={true} />
            </VStack>
          </Box>
        </Box>

        {/* Social Proof */}
        <Box width="full" pt={8} pb={4}>
          <VStack spacing={6}>
            <Box maxW="xl" mx="auto">
              <Testimonials />
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default LimitMessage;
