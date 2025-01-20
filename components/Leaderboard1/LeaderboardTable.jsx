// LeaderboardTable.jsx
import React from "react";
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { formatLargeNumber } from "./utils";

function getTrophy(index) {
  if (index === 0) return " 🥇";
  if (index === 1) return " 🥈";
  if (index === 2) return " 🥉";
  return "";
}

export default function LeaderboardTable({
  models = [],
  runsField = "run_count",
  heading = "Leaderboard",
}) {
  return (
    <>
      <Heading size="md" mb={3}>
        {heading}
      </Heading>

      {models.length === 0 ? (
        <Text fontStyle="italic" mb={6}>
          No data found.
        </Text>
      ) : (
        <Box overflowX="auto" border="1px solid #ddd" borderRadius="md" mb={8}>
          {/* Let the browser auto-size columns */}
          <Table variant="simple" width="100%">
            <Thead bg="gray.100">
              <Tr>
                <Th>Rank</Th>
                <Th>Model</Th>
                <Th>Run Count</Th>
                <Th>Description</Th>
              </Tr>
            </Thead>
            <Tbody>
              {models.map((model, index) => {
                const rawValue = model[runsField] || 0;
                const runCountFormatted = formatLargeNumber(rawValue);

                // Construct link for your own model route as needed
                const linkHref = `/models/replicate/${encodeURIComponent(
                  model.name
                )}-${encodeURIComponent(model.owner)}`;

                return (
                  <Tr key={`${model.owner}/${model.name}`}>
                    <Td fontWeight="bold">
                      {index + 1}
                      {getTrophy(index)}
                    </Td>
                    <Td>
                      <ChakraLink
                        href={linkHref}
                        color="blue.500"
                        fontWeight="semibold"
                      >
                        {model.name}
                      </ChakraLink>
                    </Td>
                    <Td>{runCountFormatted}</Td>
                    <Td>
                      {/* Wrap the description in a Box so we can clamp lines */}
                      <Box
                        noOfLines={2}
                        whiteSpace="normal"
                        wordBreak="break-word"
                      >
                        {model.description || "No description"}
                      </Box>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}
    </>
  );
}
