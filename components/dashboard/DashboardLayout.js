// components/DashboardLayout.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  useMediaQuery,
  VStack,
  HStack,
  IconButton,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaSearch, FaBook, FaUser, FaNewspaper, FaEdit } from "react-icons/fa";
import TrendingTopics from "../TrendingTopics";
import TopViewedPapers from "../TopViewedPapers";
import TopSearchQueries from "../TopSearchQueries";
import { useAuth } from "@/context/AuthContext";
import supabase from "@/pages/api/utils/supabaseClient";
import FolderModal from "../FolderModal";

const NavItem = ({ icon, label, href, isActive }) => {
  return (
    <Link href={href}>
      <Flex
        align="center"
        p={2}
        mx={2}
        borderRadius="lg"
        role="group"
        cursor="pointer"
        color={isActive ? "blue.500" : "gray.600"}
        _hover={{
          bg: "blue.50",
        }}
      >
        {icon}
        <Text ml={4} display={{ base: "none", md: "block" }}>
          {label}
        </Text>
      </Flex>
    </Link>
  );
};

const DashboardLayout = ({ children }) => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const [isLargerThan1024] = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("#000000");
  const {
    isOpen: isFolderModalOpen,
    onOpen: onFolderModalOpen,
    onClose: onFolderModalClose,
  } = useDisclosure();

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;

      setFolders(data || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderColor(folder.color || "#000000");
    onFolderModalOpen();
  };

  const handleSaveFolder = async () => {
    if (!folderName.trim()) return;

    try {
      const { data, error } = await supabase
        .from("folders")
        .update({
          name: folderName.trim(),
          color: folderColor,
        })
        .eq("id", editingFolder.id)
        .eq("user_id", user.id)
        .select();

      if (error || !data) {
        throw new Error("Folder update failed");
      }

      setFolders(folders.map((f) => (f.id === editingFolder.id ? data[0] : f)));
      setEditingFolder(null);
      setFolderName("");
      setFolderColor("#000000");
      onFolderModalClose();
    } catch (error) {
      console.error("Error updating folder:", error);
    }
  };

  // Define navigation items before and after folders
  const navItemsBeforeFolders = [
    { icon: <FaSearch />, label: "Discover", href: "/dashboard/discover" },
    {
      icon: <FaNewspaper />,
      label: "Weekly Digest",
      href: "/dashboard/weekly-paper-summary",
    },
    { icon: <FaBook />, label: "Bookmarks", href: "/dashboard/library" },
  ];

  const navItemsAfterFolders = [
    { icon: <FaUser />, label: "Profile", href: "/account" },
  ];

  return (
    <Flex direction={{ base: "column", md: "row" }} minHeight="100vh">
      {isLargerThan768 && (
        <Box width="180px" bg="white" py={8}>
          <VStack spacing={4} align="stretch">
            {/* Render nav items before folders */}
            {navItemsBeforeFolders.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={router.pathname === item.href}
              />
            ))}

            {/* Render folders indented under "Bookmarks" */}
            {folders.map((folder) => (
              <Flex
                key={folder.id}
                align="center"
                pl={8} // Indent folders
                pr={2}
                py={1}
                bg={
                  router.query.folderId === folder.id
                    ? "blue.50"
                    : "transparent"
                }
                cursor="pointer"
                onClick={() =>
                  router.push(`/dashboard/library?folderId=${folder.id}`)
                }
              >
                <Box
                  width="12px"
                  height="12px"
                  borderRadius="50%"
                  bg={folder.color || "gray.500"}
                  mr={2}
                />
                <Text flex="1" fontSize="sm">
                  {folder.name}
                </Text>
                <IconButton
                  icon={<FaEdit />}
                  size="xs"
                  variant="ghost"
                  aria-label="Edit Folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditFolder(folder);
                  }}
                />
              </Flex>
            ))}

            {/* Render nav items after folders */}
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
      <Box
        flex={1}
        overflowY="auto"
        width={{
          base: "100%",
          md: "calc(100% - 200px)",
          lg: "calc(100% - 450px)",
        }}
      >
        {children}
      </Box>
      {isLargerThan1024 && (
        <Box width="250px">
          <TrendingTopics />
          <TopViewedPapers />
          <TopSearchQueries />
        </Box>
      )}
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
      {/* Folder Edit Modal */}
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          onFolderModalClose();
          setEditingFolder(null);
        }}
        folderName={folderName}
        setFolderName={setFolderName}
        folderColor={folderColor}
        setFolderColor={setFolderColor}
        onSave={handleSaveFolder}
        mode="edit"
      />
    </Flex>
  );
};

export default DashboardLayout;
