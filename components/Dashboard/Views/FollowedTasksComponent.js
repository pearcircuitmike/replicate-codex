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

const FollowedTasksComponent = () => {
  const { user } = useAuth();
  const [topTaskItems, setTopTaskItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchTopTaskItems = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const response = await fetch(
            `/api/dashboard/get-followed-tasks?userId=${user.id}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch top task items.");
          }

          const data = await response.json();
          setTopTaskItems(data.topTaskItems);
        } catch (error) {
          console.error("Error fetching top task items:", error);
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTopTaskItems();
  }, [user]);

  return (
    <Box px={"2vw"} color="gray.700" py={4}>
      <Heading as="h1" size="xl" mb={8}>
        Top Items for Your Followed Tasks
      </Heading>

      {isLoading && <Spinner size="lg" />}

      {hasError && (
        <Text color="red.500" mb={4}>
          Failed to load data. Please try again later.
        </Text>
      )}

      {!isLoading && !hasError && topTaskItems.length === 0 && (
        <Text>No top items found for your followed tasks.</Text>
      )}

      {!isLoading && !hasError && topTaskItems.length > 0 && (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Task ID</Th>
              <Th>Top Item 1</Th>
              <Th>Top Item 2</Th>
              <Th>Top Item 3</Th>
            </Tr>
          </Thead>
          <Tbody>
            {topTaskItems.map((task) => (
              <Tr key={task.followedTaskId}>
                <Td>{task.followedTaskId}</Td>
                <Td>{task.topItems[0] || "N/A"}</Td>
                <Td>{task.topItems[1] || "N/A"}</Td>
                <Td>{task.topItems[2] || "N/A"}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default FollowedTasksComponent;
