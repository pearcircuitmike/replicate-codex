import React, { useState } from "react";
import {
  VStack,
  Text,
  Box,
  Container,
  Button,
  Heading,
  Progress,
  Flex,
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { BellIcon, TimeIcon, ChevronLeftIcon } from "@chakra-ui/icons";

const FrequencyOption = ({ icon, title, description, isSelected, onClick }) => (
  <Box
    onClick={onClick}
    cursor="pointer"
    borderWidth="2px"
    borderRadius="xl"
    p={6}
    borderColor={isSelected ? "blue.500" : "gray.200"}
    bg={isSelected ? "blue.50" : "white"}
    _hover={{
      borderColor: "blue.500",
      transform: "translateY(-2px)",
      shadow: "md",
    }}
    transition="all 0.2s"
  >
    <Flex align="center" gap={4}>
      <Box p={3} borderRadius="lg" bg={isSelected ? "blue.100" : "blue.50"}>
        {icon}
      </Box>
      <Box>
        <Text fontWeight="semibold" fontSize="lg">
          {title}
        </Text>
        <Text fontSize="md" color="gray.600">
          {description}
        </Text>
      </Box>
    </Flex>
  </Box>
);

const FrequencyPage = () => {
  const [frequency, setFrequency] = useState("daily");
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleContinue = async () => {
    try {
      const response = await fetch("/api/onboarding/complete-frequency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update onboarding status");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating frequency:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="4xl" py={8}>
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ChevronLeftIcon />}
            onClick={() => router.push("/onboarding/topics")}
          >
            Back
          </Button>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Step 3 of 4 - Choose Frequency
          </Text>
          <Box w={16} /> {/* Spacer to maintain centering */}
        </Flex>
        <Progress value={75} size="sm" colorScheme="blue" borderRadius="full" />
      </Box>

      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={3}>
            How often would you like updates?
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Choose how frequently you&apos;d like to receive research updates
          </Text>
        </Box>

        <SimpleGrid columns={[1, null, 2]} spacing={6} pt={4}>
          <FrequencyOption
            icon={<BellIcon w={6} h={6} color="blue.500" />}
            title="Daily Digest"
            description="Get a summary of the day's most important developments"
            isSelected={frequency === "daily"}
            onClick={() => setFrequency("daily")}
          />
          <FrequencyOption
            icon={<TimeIcon w={6} h={6} color="blue.500" />}
            title="Weekly Roundup"
            description="Receive a comprehensive weekly summary every Monday"
            isSelected={frequency === "weekly"}
            onClick={() => setFrequency("weekly")}
          />
        </SimpleGrid>

        <Box display="flex" justifyContent="center" pt={8}>
          <Button colorScheme="blue" onClick={handleContinue} size="lg" px={8}>
            Continue
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default FrequencyPage;
