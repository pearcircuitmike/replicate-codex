// components/Dashboard/Views/UserTopTaskPapersView.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { useAuth } from "../../../context/AuthContext";

const UserTopTaskPapersView = () => {
  const { user } = useAuth();
  const [topTaskPapers, setTopTaskPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchTopTaskPapers = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const response = await fetch(
            `/api/dashboard/get-user-top-task-papers?userId=${user.id}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch top task papers.");
          }

          const data = await response.json();
          setTopTaskPapers(data.topTaskPapers);
        } catch (error) {
          console.error("Error fetching top task papers:", error);
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTopTaskPapers();
  }, [user]);

  return (
    <Box px={"2vw"} color="gray.700" py={4}>
      <Heading as="h1" size="xl" mb={8}>
        Top Papers for Your Followed Tasks
      </Heading>

      {isLoading && <Spinner size="lg" />}

      {hasError && (
        <Text color="red.500" mb={4}>
          Failed to load data. Please try again later.
        </Text>
      )}

      {!isLoading && !hasError && topTaskPapers.length === 0 && (
        <Text>No top papers found for your followed tasks.</Text>
      )}

      {!isLoading && !hasError && topTaskPapers.length > 0 && (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Task ID</Th>
              <Th>Top Paper 1</Th>
              <Th>Top Paper 2</Th>
              <Th>Top Paper 3</Th>
            </Tr>
          </Thead>
          <Tbody>
            {topTaskPapers.map((task) => (
              <Tr key={task.followedTaskId}>
                <Td>{task.followedTaskId}</Td>
                <Td>{task.topPapers[0] || "N/A"}</Td>
                <Td>{task.topPapers[1] || "N/A"}</Td>
                <Td>{task.topPapers[2] || "N/A"}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default UserTopTaskPapersView;
