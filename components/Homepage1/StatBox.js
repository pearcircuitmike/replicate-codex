import React from "react";
import CountUp from "react-countup";
import {
  Box,
  Heading,
  Text,
  Stat,
  StatNumber,
  StatLabel,
  StatGroup,
} from "@chakra-ui/react";

const StatBox = ({ title, description, stat, statDescription }) => (
  <Box
    bg="white"
    p={6}
    borderRadius="md"
    boxShadow="md"
    textAlign="center"
    width="100%"
  >
    <Heading fontSize="lg" mb={2}>
      {title}
    </Heading>
    <Text fontSize="sm" mb={2} color="gray.700">
      {description}
    </Text>
    <StatGroup>
      <Stat>
        <StatNumber fontSize="2xl" color="blue.500" mb={1}>
          {stat !== undefined ? (
            <CountUp
              start={0}
              end={stat}
              duration={2.5}
              separator=","
              delay={0.2}
            />
          ) : (
            "Loading..."
          )}
        </StatNumber>
        <StatLabel fontSize="xs" color="gray.600">
          {statDescription}
        </StatLabel>
      </Stat>
    </StatGroup>
  </Box>
);

export default StatBox;
