// pages/replicate-stats.js

import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { orderBy } from "lodash-es";
import AuthForm from "@/components/AuthForm";

// Helper to format large run counts (e.g., 24K, 3.5M, etc.)
function formatLargeNumber(num) {
  if (!num) return "0";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

// Return a trophy icon for the top 3 ranks
function getTrophy(index) {
  if (index === 0) return " 🥇";
  if (index === 1) return " 🥈";
  if (index === 2) return " 🥉";
  return "";
}

// Fetch data on the server at build time
export async function getStaticProps() {
  // Dynamically import the node-based data on the server side
  const modelsModule = await import("all-the-public-replicate-models");
  const models = modelsModule.default || [];

  // Sort by run_count descending and slice top 10
  const topTen = orderBy(models, ["run_count"], ["desc"]).slice(0, 10);

  return {
    props: {
      topTen,
    },
    // Rebuild this page once a day (in seconds)
    revalidate: 60 * 60 * 24,
  };
}

export default function ReplicateStats({ topTen }) {
  return (
    <Container maxW="4xl" py={8}>
      <Heading size="lg" mb={2}>
        Replicate Leaderboard
      </Heading>
      <Text mb={8}>
        The models below are currently the most popular on Replicate, based on
        their total run counts. These numbers update once a day. Click on a
        model&apos;s link to learn more about it.
      </Text>

      {/* Leaderboard */}
      <Box overflowX="auto" border="1px solid #ddd" borderRadius="md" mb={8}>
        <Table variant="simple">
          <Thead bg="gray.100">
            <Tr>
              <Th>Rank</Th>
              <Th>Model</Th>
              <Th>Runs</Th>
              <Th>Description</Th>
            </Tr>
          </Thead>
          <Tbody>
            {topTen.map((model, index) => {
              const runCountFormatted = formatLargeNumber(model.run_count);

              // Format: /models/replicate/modelName-owner
              // E.g., /models/replicate/whisper-openai
              const linkHref = `/models/replicate/${encodeURIComponent(
                model.name
              )}-${encodeURIComponent(model.owner)}`;

              return (
                <Tr key={model.url}>
                  <Td fontWeight="bold">
                    {index + 1}
                    {getTrophy(index)}
                  </Td>
                  <Td>
                    <Link
                      href={linkHref}
                      color="blue.500"
                      fontWeight="semibold"
                    >
                      {model.owner}/{model.name}
                    </Link>
                  </Td>
                  <Td>{runCountFormatted}</Td>
                  <Td>
                    <Text noOfLines={2}>
                      {model.description || "No description"}
                    </Text>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>

      {/* Auth Form */}
      <Box align="center" mt={5}>
        <Heading size="md" my={2}>
          Want to get updates when new models top the charts?
        </Heading>
        <Text mb={4}>
          Sign up below to stay informed about emerging models on Replicate.
        </Text>
        <AuthForm isUpgradeFlow />
      </Box>
    </Container>
  );
}
