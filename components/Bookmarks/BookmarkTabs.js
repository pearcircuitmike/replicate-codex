// /components/Bookmarks/BookmarkTabs.js
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
} from "@chakra-ui/react";
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
      <Tab>
        <Text fontSize={{ base: "sm", md: "md" }}>Papers</Text>
        <Text ml={1} color="gray.500" fontSize={{ base: "sm", md: "md" }}>
          ({paperBookmarks.length})
        </Text>
      </Tab>
      <Tab>
        <Text fontSize={{ base: "sm", md: "md" }}>Models</Text>
        <Text ml={1} color="gray.500" fontSize={{ base: "sm", md: "md" }}>
          ({modelBookmarks.length})
        </Text>
      </Tab>
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
