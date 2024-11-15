import React from "react";
import {
  Box,
  Stack,
  Heading,
  Text,
  List,
  ListItem,
  ListIcon,
  Container,
  Divider,
  Center,
  useColorModeValue,
  Alert,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { FaLightbulb, FaFire, FaDiscord } from "react-icons/fa";
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
  const highlightBg = useColorModeValue("gray.100", "blue.900");

  const features = [
    {
      icon: FaFire,
      title: "Never miss an AI breakthrough",
      description: "See the top AI/ML research as it comes out",
    },
    {
      icon: FaLightbulb,
      title: "Save hours reading papers",
      description: "Skim the key insights from any paper in 2 minutes or less",
    },
    {
      icon: FaDiscord,
      title: "Meet and collaborate with your peers",
      description: "Join the Discord to get help and advice",
    },
  ];

  return (
    <Container maxW="container.md" backgroundColor="white" rounded={"5px"}>
      <Stack spacing={8} py={8}>
        {/* Limit Message */}
        <Alert
          status="warning"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="lg"
          p={4}
        >
          <AlertTitle mb={1} fontSize="lg">
            You&apos;ve reached your limit of free summaries this month
          </AlertTitle>
          <AlertDescription>
            Upgrade now to continue accessing paper summaries
          </AlertDescription>
        </Alert>

        {/* Main Heading */}
        <Box textAlign="center">
          <Heading
            size="lg"
            mb={3}
            color={useColorModeValue("gray.800", "white")}
          >
            Keep reading research that matters
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Join 10,000+ devs, researchers, and founders by creating an account
          </Text>
        </Box>

        {/* Value Proposition */}
        <Box
          bg={bgColor}
          borderRadius="xl"
          borderWidth={1}
          borderColor={borderColor}
          boxShadow="lg"
          overflow="hidden"
          pt={1}
        >
          <Center>
            <List spacing={0} p={4} divider={<Divider />}>
              {features.map((feature, index) => (
                <FeatureItem key={index} {...feature} />
              ))}
            </List>
          </Center>

          {/* Auth Form Section */}
          <Box bg={highlightBg} p={8} justifyContent="center">
            <Stack spacing={6}>
              <Box textAlign="center">
                <Text fontSize="lg" fontWeight="bold" color="gray.900" mb={1}>
                  Try it for free for 7 days
                </Text>
                <Text fontSize="md" color="gray.600">
                  Cancel any time, no questions asked
                </Text>
              </Box>
              <Box display="flex" justifyContent="center">
                <AuthForm isUpgradeFlow={true} signupSource="limit-message" />
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Social Proof */}
        <Box pt={8} pb={4}>
          <Testimonials />
        </Box>
      </Stack>
    </Container>
  );
};

export default LimitMessage;
