import React, { useState, useEffect } from "react";
import {
  VStack,
  Text,
  Box,
  SimpleGrid,
  useToast,
  Container,
  Button,
  Heading,
  Spinner,
  Progress,
  Flex,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

const RoleCard = ({
  role,
  icon,
  description,
  isSelected,
  onSelect,
  isUpdating,
}) => (
  <Box
    onClick={onSelect}
    cursor={isUpdating ? "wait" : "pointer"}
    borderWidth="2px"
    borderRadius="xl"
    overflow="hidden"
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    transition="all 0.2s"
    bg={isSelected ? "blue.50" : "white"}
    borderColor={isSelected ? "blue.500" : "gray.200"}
    _hover={{
      borderColor: "blue.500",
      transform: isUpdating ? "none" : "translateY(-2px)",
      shadow: "md",
    }}
    opacity={isUpdating ? 0.7 : 1}
    p={6}
    h="full"
  >
    <Text fontSize="3xl" mb={3}>
      {icon}
    </Text>
    <Text
      fontSize="lg"
      fontWeight="semibold"
      textAlign="center"
      color={isSelected ? "blue.600" : "gray.700"}
      mb={2}
    >
      {role}
    </Text>
    <Text
      fontSize="sm"
      textAlign="center"
      color={isSelected ? "blue.600" : "gray.500"}
    >
      {description}
    </Text>
    {isUpdating && (
      <Spinner
        size="sm"
        position="absolute"
        top="2"
        right="2"
        color="blue.500"
      />
    )}
  </Box>
);

// Define all roles
const allRoles = [
  {
    id: "researcher",
    role: "Researcher",
    icon: "🔬",
    description: "I conduct research and publish papers",
  },
  {
    id: "student",
    role: "Student",
    icon: "📚",
    description: "I'm studying and learning",
  },
  {
    id: "founder",
    role: "Founder",
    icon: "🚀",
    description: "I'm building a company or startup",
  },
  {
    id: "developer",
    role: "Developer",
    icon: "💻",
    description: "I write code and build software",
  },
  {
    id: "other",
    role: "Other",
    icon: "✨",
    description: "I have a different role",
  },
];

// Separate and shuffle roles while keeping "other" last
const otherRole = allRoles.find((role) => role.id === "other");
const mainRoles = allRoles.filter((role) => role.id !== "other");
const shuffledMainRoles = [...mainRoles]
  .map((value) => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value);

const roles = [...shuffledMainRoles, otherRole];

export default function RoleSelectionPage() {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const updateRolesInDb = async (newRoles) => {
    try {
      const response = await fetch("/api/onboarding/update-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ roles: newRoles }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update roles");
      return true;
    } catch (error) {
      console.error("Error updating roles:", error);
      toast({
        title: "Error",
        description: "Failed to update role selection. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
  };

  const handleRoleSelect = async (roleId) => {
    setUpdatingRole(roleId);
    const newRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter((id) => id !== roleId)
      : [...selectedRoles, roleId];

    const success = await updateRolesInDb(newRoles);
    if (success) setSelectedRoles(newRoles);
    setUpdatingRole(null);
  };

  const handleContinue = async () => {
    if (selectedRoles.length === 0) {
      toast({
        title: "Select roles",
        description: "Please select at least one role to continue",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/onboarding/complete-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) throw new Error("Failed to update onboarding status");
      router.push("/onboarding/topics");
    } catch (error) {
      console.error("Error updating roles:", error);
      toast({
        title: "Error",
        description: "Failed to update role selection. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/onboarding/complete-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) throw new Error("Failed to update onboarding status");
      router.push("/onboarding/topics");
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      toast({
        title: "Error",
        description: "Failed to skip onboarding. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch("/api/onboarding/get-roles", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch roles");

        const data = await response.json();
        setSelectedRoles(data.roles || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast({
          title: "Error",
          description: "Failed to load your roles. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchUserRoles();
  }, [user?.id, accessToken]);

  if (!user || loadingRoles) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ChevronLeftIcon />}
            onClick={() => router.push("/signup")}
          >
            Back
          </Button>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Step 1 of 4 - Choose Roles
          </Text>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ChevronRightIcon />}
            onClick={handleContinue}
          >
            Next
          </Button>
        </Flex>
        <Progress value={25} size="sm" colorScheme="blue" borderRadius="full" />
      </Box>

      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={3}>
            I am a...
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Select all that apply
          </Text>
        </Box>

        <SimpleGrid columns={[1, 2, 3]} spacing={6} pt={4}>
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              {...role}
              isSelected={selectedRoles.includes(role.id)}
              onSelect={() => handleRoleSelect(role.id)}
              isUpdating={updatingRole === role.id}
            />
          ))}
        </SimpleGrid>

        <Flex justify="space-between" pt={8}>
          <Button
            variant="ghost"
            onClick={handleSkip}
            isDisabled={isLoading || updatingRole !== null}
          >
            Skip for now
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleContinue}
            isLoading={isLoading}
            isDisabled={updatingRole !== null}
            size="lg"
            px={8}
          >
            Continue
          </Button>
        </Flex>
      </VStack>
    </Container>
  );
}
