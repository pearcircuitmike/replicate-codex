import React from "react";
import { Box, Container } from "@chakra-ui/react";
import DashboardLayout from "@/components/Dashboard/Layout/DashboardLayout";
import UserTopTaskPapersView from "@/components/Dashboard/Views/UserTopTaskPapersView";

const UserTopTaskPapersPage = () => {
  return (
    <DashboardLayout>
      <Container maxW="container.xl" py={8}>
        <Box>
          <UserTopTaskPapersView />
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default UserTopTaskPapersPage;
