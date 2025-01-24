// /components/Community/CommunityTabs.jsx
import React from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import CommunityPapersTab from "./CommunityPapersTab";
import CommunityFollowersTab from "./CommunityFollowersTab";
import CommunityNotesTab from "./CommunityNotesTab";

const CommunityTabs = ({ papers, followers, notes }) => {
  return (
    <Tabs variant="enclosed" colorScheme="blue">
      <TabList>
        <Tab>Papers</Tab>
        <Tab>Followers</Tab>
        <Tab>Notes</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <CommunityPapersTab papers={papers} />
        </TabPanel>
        <TabPanel>
          <CommunityFollowersTab followers={followers} />
        </TabPanel>
        <TabPanel>
          <CommunityNotesTab notes={notes} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default CommunityTabs;
