import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

function StatBox({ title, description, stat, statDescription }) {
  return (
    <Box bg="white" p={6} borderRadius="md" boxShadow="md" textAlign="center">
      <Heading fontSize="lg" mb={2}>
        {title}
      </Heading>
      <Text fontSize="sm" mb={2} color="gray.700">
        {description}
      </Text>
      <Heading fontSize="2xl" color="red.500" mb={1}>
        {stat}
      </Heading>
      <Text fontSize="xs" color="gray.600">
        {statDescription}
      </Text>
    </Box>
  );
}

export default StatBox;
