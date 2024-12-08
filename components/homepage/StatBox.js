import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  useMediaQuery,
} from "@chakra-ui/react";
import Counter from "./Counter";

const StatBox = ({ title, text, stat, label, gradient }) => {
  const [isMobile] = useMediaQuery("(max-width: 480px)");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats/get-overall-stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box
      width="100%"
      bg={gradient || "white"}
      borderRadius="lg"
      boxShadow="lg"
      overflow="hidden"
      position="relative"
    >
      <Flex
        direction={isMobile ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isMobile ? "center" : "flex-start"}
        p={8}
        width="100%"
      >
        <Box flex="1">
          <Heading as="h3" fontSize="2xl" fontWeight="semibold" mb={4}>
            {title}
          </Heading>
          <Text fontSize="lg" color="gray.700">
            {text}
          </Text>
        </Box>

        <Stat textAlign="right" minW="200px">
          <StatNumber
            fontSize="6xl"
            fontWeight="bold"
            color="red.500"
            lineHeight="1"
          >
            {stats && <Counter start={0} end={stats[stat]} />}
          </StatNumber>
          <StatLabel fontSize="sm" color="gray.600" mt={2}>
            {label}
          </StatLabel>
        </Stat>
      </Flex>
    </Box>
  );
};

export default StatBox;
