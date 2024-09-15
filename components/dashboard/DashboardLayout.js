import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  useMediaQuery,
  VStack,
  HStack,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FaSearch, FaUser, FaNewspaper } from "react-icons/fa";
import NavItem from "./NavItem";
import FolderSidebar from "./FolderSidebar";
import FolderModal from "./FolderModal";
import supabase from "@/pages/api/utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import TrendingTopics from "../TrendingTopics";
import TopViewedPapers from "../TopViewedPapers";
import TopSearchQueries from "../TopSearchQueries";

const DashboardLayout = ({ children }) => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const [isLargerThan1024] = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  const fetchFolders = async () => {
    try {
      // Fetch folders for the current user
      const { data: folderData, error: folderError } = await supabase
        .from("folders")
        .select("id, name, color, position")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (folderError) throw folderError;

      // Fetch bookmark counts for each folder
      const foldersWithCounts = await Promise.all(
        folderData.map(async (folder) => {
          const { count, error: countError } = await supabase
            .from("bookmarks")
            .select("id", { count: "exact", head: true })
            .eq("folder_id", folder.id)
            .eq("user_id", user.id);

          if (countError) throw countError;

          return {
            ...folder,
            bookmarkCount: count || 0,
          };
        })
      );

      setFolders(foldersWithCounts);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const handleFolderModalOpen = () => {
    setIsFolderModalOpen(true);
  };

  const handleFolderModalClose = () => {
    setIsFolderModalOpen(false);
  };

  const navItemsBeforeFolders = [
    { icon: <FaSearch />, label: "Discover", href: "/dashboard/discover" },
    {
      icon: <FaNewspaper />,
      label: "Weekly Digest",
      href: "/dashboard/weekly-paper-summary",
    },
  ];

  const navItemsAfterFolders = [
    { icon: <FaUser />, label: "Profile", href: "/account" },
  ];

  return (
    <Flex direction={{ base: "column", md: "row" }} minHeight="100vh">
      {isLargerThan768 && (
        <Box
          width="200px"
          bg="white"
          py={8}
          overflowY="auto"
          borderRight="1px solid #e2e8f0"
        >
          <VStack spacing={2} align="stretch">
            {/* Navigation items before folders */}
            {navItemsBeforeFolders.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={router.pathname === item.href}
              />
            ))}
            {/* "My Folders" label */}
            <Box px={4} py={2}>
              <Text fontSize="lg" fontWeight="bold">
                My Folders
              </Text>
            </Box>
            {/* Folder Sidebar */}
            <FolderSidebar
              folders={folders}
              setFolders={setFolders}
              onFolderModalOpen={handleFolderModalOpen}
              fetchFolders={fetchFolders}
            />
            {/* Navigation items after folders */}
            {navItemsAfterFolders.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={router.pathname === item.href}
              />
            ))}
          </VStack>
        </Box>
      )}

      {/* Main content */}
      <Box flex={1} overflowY="auto">
        {children}
      </Box>

      {/* Right Sidebar */}
      {isLargerThan1024 && (
        <Box width="250px" bg="white" py={8} borderLeft="1px solid #e2e8f0">
          <TrendingTopics />
          <TopViewedPapers />
          <TopSearchQueries />
        </Box>
      )}

      {/* Bottom navigation for mobile */}
      {!isLargerThan768 && (
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg="white"
          boxShadow="0 -2px 10px rgba(0, 0, 0, 0.05)"
        >
          <HStack justify="space-around" py={2}>
            {navItemsBeforeFolders.concat(navItemsAfterFolders).map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={router.pathname === item.href}
              />
            ))}
          </HStack>
        </Box>
      )}

      {/* Folder Modal */}
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={handleFolderModalClose}
        fetchFolders={fetchFolders}
      />
    </Flex>
  );
};

export default DashboardLayout;
