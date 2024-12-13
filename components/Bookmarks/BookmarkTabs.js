// /components/Bookmarks/BookmarkTabs.js
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import BookmarkList from "./BookmarkList";

const BookmarkTabs = ({
  paperBookmarks,
  modelBookmarks,
  isLoadingPapers,
  isLoadingModels,
  onRemoveBookmark,
}) => (
  <Tabs variant="line">
    <TabList borderBottomWidth="1px" mb={6}>
      <Tab>Papers</Tab>
      <Tab>Models</Tab>
    </TabList>

    <TabPanels>
      <TabPanel p={0}>
        <BookmarkList
          bookmarks={paperBookmarks}
          isLoading={isLoadingPapers}
          onRemoveBookmark={onRemoveBookmark}
          type="paper"
        />
      </TabPanel>

      <TabPanel p={0}>
        <BookmarkList
          bookmarks={modelBookmarks}
          isLoading={isLoadingModels}
          onRemoveBookmark={onRemoveBookmark}
          type="model"
        />
      </TabPanel>
    </TabPanels>
  </Tabs>
);

export default BookmarkTabs;
