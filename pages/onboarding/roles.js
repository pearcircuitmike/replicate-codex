import React from "react";
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
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

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
    borderWidth="1px"
    borderRadius="lg"
    overflow="hidden"
    w="full"
    h="40"
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    transition="all 0.2s"
    bg={isSelected ? "blue.50" : "white"}
    borderColor={isSelected ? "blue.500" : "gray.200"}
    _hover={{
      borderColor: "blue.500",
      transform: isUpdating ? "none" : "scale(1.02)",
      shadow: "md",
    }}
    opacity={isUpdating ? 0.7 : 1}
    p={6}
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

const roles = [
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

export default function RoleSelectionPage() {
  const [selectedRoles, setSelectedRoles] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [updatingRole, setUpdatingRole] = React.useState(null);
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const updateRolesInDb = async (newRoles) => {
    try {
      const response = await fetch("/api/update-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ roles: newRoles }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update roles");
      }

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

    if (success) {
      setSelectedRoles(newRoles);
    }
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

      if (!response.ok) {
        throw new Error("Failed to update onboarding status");
      }

      router.push("/dashboard");
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

      if (!response.ok) {
        throw new Error("Failed to update onboarding status");
      }

      router.push("/dashboard");
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

  if (!user) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Container maxW="4xl" py={12}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={4}>
            I am a...
          </Heading>
          <Text color="gray.600" mb={2}>
            Select all that apply
          </Text>
        </Box>

        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
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

        <Box display="flex" justifyContent="space-between" pt={6}>
          <Button
            variant="ghost"
            onClick={handleSkip}
            isDisabled={isLoading || updatingRole !== null}
          >
            Do this later
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleContinue}
            isLoading={isLoading}
            isDisabled={updatingRole !== null}
          >
            Continue
          </Button>
        </Box>
      </VStack>
    </Container>
  );
}
