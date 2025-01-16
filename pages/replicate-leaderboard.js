// pages/replicate-leaderboard.js

import React from "react";
import {
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
  Box,
} from "@chakra-ui/react";
import { orderBy } from "lodash-es";
import AuthForm from "@/components/AuthForm";
import MetaTags from "@/components/MetaTags";

function formatLargeNumber(num) {
  if (!num) return "0";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function getTrophy(index) {
  if (index === 0) return " 🥇";
  if (index === 1) return " 🥈";
  if (index === 2) return " 🥉";
  return "";
}

export async function getStaticProps() {
  // Dynamically import node-based modules on the server side
  const modelsModule = await import("all-the-public-replicate-models");
  const allModels = modelsModule.default || [];

  // Sort by run_count and get the top 10
  const topTen = orderBy(allModels, ["run_count"], ["desc"]).slice(0, 10);

  return {
    props: {
      topTen,
    },
    revalidate: 60 * 60 * 24, // Rebuild once a day
  };
}

export default function ReplicateLeaderboard({ topTen }) {
  return (
    <>
      {/* Meta tags with a fallback OG image */}
      <MetaTags
        title="AIModels.fyi - Replicate Leaderboard"
        description="Check out the top Replicate models by run count. Updated daily."
        canonicalUrl="https://www.aimodels.fyi/replicate-leaderboard"
        socialPreviewImage="/og-fallback.png"
        socialPreviewTitle="Top 10 Replicate Models"
        socialPreviewSubtitle="Daily updated stats from Replicate"
      />

      <Container maxW="4xl" py={8}>
        <Heading size="lg" mb={2}>
          Replicate Leaderboard
        </Heading>
        <Text mb={8}>
          The models below are the most popular on Replicate, based on total run
          counts. Updated daily. Click on a model&apos;s link to learn more.
        </Text>

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
                // Example URL format: /models/replicate/modelName-owner
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
    </>
  );
}
