import React from "react";
import { Box, Container } from "@chakra-ui/react";
import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import FollowedTasksComponent from "@/components/Dashboard/Views/FollowedTasksComponent";

const FollowedTasksPage = () => {
  return (
    <DashboardLayout>
      <Container maxW="container.xl" py={8}>
        <Box>
          <FollowedTasksComponent />
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default FollowedTasksPage;
