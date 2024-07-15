import React from "react";
import { Text } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import DiscoverView from "../../components/dashboard/DiscoverView";

const DiscoverPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <DashboardLayout>
        <Text fontSize="xl">Please log in to view the Discover page.</Text>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DiscoverView />
    </DashboardLayout>
  );
};

export default DiscoverPage;
