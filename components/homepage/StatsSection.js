import React from "react";
import { Box, Container, Heading, Button, VStack } from "@chakra-ui/react";
import Link from "next/link";
import StatBox from "./StatBox";

const StatsSection = () => {
  return (
    <Box bg="gray.50" py={16} width="100%">
      <Container maxW="7xl">
        <Heading as="h2" fontSize="4xl" mb={16} textAlign="center">
          How it works
        </Heading>

        <VStack spacing={8} width="100%">
          <StatBox
            title="Discover AI breakthroughs"
            text="Our listening algorithm identifies the AI developments with the biggest impact."
            stat="weeklyPapersCount"
            label="Papers and models released this week"
          />

          <StatBox
            title="Skim summaries of each discovery"
            text="We translate models and papers into short, clear guides."
            stat="weeklySummariesCount"
            label="Summaries created this week"
          />

          <StatBox
            title="Meet helpful experts and friends"
            text="Join the Discord to chat with the creators and builders behind the breakthroughs."
            stat="weeklySignups"
            label="New ML researchers this week"
          />

          <StatBox
            title="Subscribe now for personalized insights"
            text="Get exclusive access to our AI community and more!"
            stat="uniquePapersCount"
            label="Unique papers across top tasks"
            gradient="linear(to-r, yellow.400, yellow.300)"
          />

          <Box textAlign="center" mt={8} width="100%">
            <Link href="/login" passHref>
              <Button
                colorScheme="teal"
                size="lg"
                height="60px"
                width="200px"
                fontSize="xl"
              >
                Subscribe Now
              </Button>
            </Link>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default StatsSection;
