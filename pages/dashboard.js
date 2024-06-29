import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Heading,
  Text,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
} from "@chakra-ui/react";
import { FaBookmark, FaChartLine } from "react-icons/fa";
import UserBookmarks from "../components/UserBookmarks";
import TrendingSection from "../components/TrendingSection";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Container maxW="7xl" py={8}>
        <Text fontSize="xl" mb={8}>
          Please log in to view your dashboard.
        </Text>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <Heading as="h1" size="2xl" mb={8}>
        Dashboard
      </Heading>

      <Tabs isFitted variant="enclosed" defaultIndex={0}>
        <TabList mb="1em">
          <Tab>
            <Icon as={FaChartLine} mr={2} />
            Trending
          </Tab>
          <Tab>
            <Icon as={FaBookmark} mr={2} />
            Bookmarks
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TrendingSection />
          </TabPanel>
          <TabPanel>
            <UserBookmarks resourceType="paper" />
            <UserBookmarks resourceType="model" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default Dashboard;
