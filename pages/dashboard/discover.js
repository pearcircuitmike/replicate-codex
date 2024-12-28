import React from "react";
import { Text } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/Dashboard/Layout/DashboardLayout";
import DiscoverView from "../../components/Dashboard/Views/DiscoverView";
import MetaTags from "../../components/MetaTags";

const DiscoverPage = () => {
  const { user } = useAuth();

  return (
    <>
      <MetaTags
        title="Discover"
        description="Explore and discover new AI models, research papers, and trending topics"
        socialPreviewTitle="Discover - AIModels.fyi"
        socialPreviewSubtitle="Find new AI research and models"
      />

      <DashboardLayout>
        {!user ? (
          <Text fontSize="xl">Please log in to view the Discover page.</Text>
        ) : (
          <DiscoverView />
        )}
      </DashboardLayout>
    </>
  );
};

export default DiscoverPage;
