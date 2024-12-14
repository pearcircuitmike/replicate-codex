import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Spinner, Box } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/Dashboard/Layout/DashboardLayout";

const DashboardPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to "Following" page if the user is authenticated
    if (user) {
      router.replace("/dashboard/followed-tasks");
    }
  }, [user, router]);

  // Show a spinner while redirecting
  return (
    <DashboardLayout>
      <Box p={8} textAlign="center">
        <Spinner size="lg" />
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;
