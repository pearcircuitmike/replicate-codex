import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/Dashboard/Layout/DashboardLayout";
import DiscoverView from "../../components/Dashboard/Views/DiscoverView";

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <DashboardLayout>
        <Box p={8}>
          <Text fontSize="xl">Please log in to view your dashboard.</Text>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DiscoverView />
    </DashboardLayout>
  );
};

export default DashboardPage;
