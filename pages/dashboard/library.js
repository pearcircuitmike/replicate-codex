import React from "react";
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import UserBookmarks from "../../components/dashboard/UserBookmarks";

const LibraryPage = () => {
  return (
    <DashboardLayout>
      <Box p={4}>
        <Tabs>
          <TabList>
            <Tab>Papers</Tab>
            <Tab>Models</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <UserBookmarks resourceType="paper" />
            </TabPanel>
            <TabPanel>
              <UserBookmarks resourceType="model" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </DashboardLayout>
  );
};

export default LibraryPage;
