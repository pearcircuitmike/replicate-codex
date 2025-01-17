// components/leaderboard/LeaderboardTable.jsx

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
  Link,
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
          {/* Use inline style for tableLayout to avoid React warnings */}
          <Table variant="simple" style={{ tableLayout: "fixed" }}>
            <Thead bg="gray.100">
              <Tr>
                {/* Make Rank a bit wider so it’s not squished */}
                <Th width="12%">Rank</Th>
                <Th width="28%">Model</Th>
                <Th width="15%">Run count</Th>
                <Th width="45%">Description</Th>
              </Tr>
            </Thead>
            <Tbody>
              {models.map((model, index) => {
                const rawValue = model[runsField] || 0;
                const runCountFormatted = formatLargeNumber(rawValue);
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
                      <Link
                        href={linkHref}
                        color="blue.500"
                        fontWeight="semibold"
                      >
                        {model.name}
                      </Link>
                    </Td>
                    <Td>{runCountFormatted}</Td>
                    <Td noOfLines={2}>
                      {model.description || "No description"}
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
