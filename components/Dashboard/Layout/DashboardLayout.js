import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  useMediaQuery,
  VStack,
  HStack,
  Text,
  useToast,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  List,
  ListItem,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import {
  FaSearch,
  FaBookmark,
  FaFolder,
  FaBolt,
  FaStar,
  FaChartLine,
  FaFlask,
  FaCubes,
} from "react-icons/fa";
import NavItem from "./NavItem";
import FolderSidebar from "./Sidebar/FolderSidebar";
import FolderModal from "../Modals/FolderModal";
import supabase from "@/pages/api/utils/supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import { FoldersProvider } from "@/context/FoldersContext";

const DashboardLayout = ({ children }) => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const router = useRouter();
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isFolderListModalOpen, setIsFolderListModalOpen] = useState(false);
  const toast = useToast();

  const fetchFolders = useCallback(async () => {
    if (!user) return;

    try {
      const { data: folderData, error: folderError } = await supabase
        .from("folders")
        .select("id, name, color, position")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (folderError) throw folderError;

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
      toast({
        title: "Error fetching folders",
        description: error.message || "An unexpected error occurred.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [user, toast]);

  const updateFolderCount = useCallback((folderId, increment) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === folderId
          ? {
              ...folder,
              bookmarkCount: folder.bookmarkCount + (increment ? 1 : -1),
            }
          : folder
      )
    );
  }, []);

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user, fetchFolders]);

  const handleFolderModalOpen = () => {
    setIsFolderModalOpen(true);
  };

  const handleFolderModalClose = () => {
    setIsFolderModalOpen(false);
    fetchFolders();
  };

  const handleFolderListModalOpen = () => {
    setIsFolderListModalOpen(true);
  };

  const handleFolderListModalClose = () => {
    setIsFolderListModalOpen(false);
  };

  const navItems = [
    { icon: null, label: "For me", isDivider: true },
    { icon: <FaStar />, label: "Following", href: "#" },
    { icon: <FaBookmark />, label: "Bookmarks", href: "/dashboard/bookmarks" },
    { icon: <FaSearch />, label: "Discover", href: "/dashboard/discover" },
    { icon: null, label: "Community", isDivider: true },
    { icon: <FaChartLine />, label: "Trending Topics", href: "#" },
    { icon: <FaFlask />, label: "Hot Papers", href: "/dashboard/hot-papers" },
    { icon: <FaCubes />, label: "Hot Models", href: "/dashboard/hot-models" },
  ];

  return (
    <FoldersProvider
      fetchFolders={fetchFolders}
      updateFolderCount={updateFolderCount}
      folders={folders}
    >
      <Flex direction={{ base: "column", md: "row" }} minHeight="100vh">
        {/* Sidebar for larger screens */}
        {isLargerThan768 && (
          <Box
            width="300px"
            py={8}
            overflowY="auto"
            borderRight="1px solid #e2e8f0"
          >
            <VStack spacing={2} align="stretch">
              {navItems.map((item, index) =>
                item.isDivider ? (
                  <Text
                    key={index}
                    px={4}
                    py={2}
                    fontSize="sm"
                    color="gray.500"
                  >
                    {item.label}
                  </Text>
                ) : (
                  <NavItem
                    key={item.href || index}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    isActive={router.pathname === item.href}
                  />
                )
              )}
              <FolderSidebar onFolderModalOpen={handleFolderModalOpen} />
            </VStack>
          </Box>
        )}

        {/* Main Content */}
        <Box flex={1} overflowY="auto">
          {children}
        </Box>

        {/* Mobile Footer Navigation */}
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
              {navItems
                .filter((item) => !item.isDivider)
                .map((item, index) => (
                  <NavItem
                    key={item.label || index}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    isActive={router.pathname === item.href}
                  />
                ))}
            </HStack>
          </Box>
        )}

        {/* Folder Modal for Create/Edit */}
        <FolderModal
          isOpen={isFolderModalOpen}
          onClose={handleFolderModalClose}
          fetchFolders={fetchFolders}
        />

        {/* Folder List Modal for Mobile */}
        <Modal
          isOpen={isFolderListModalOpen}
          onClose={handleFolderListModalClose}
          isCentered
          size="md"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>My Folders</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {folders.length > 0 ? (
                <List spacing={3}>
                  {folders.map((folder) => (
                    <ListItem key={folder.id}>
                      <Button
                        variant="ghost"
                        width="100%"
                        justifyContent="flex-start"
                        onClick={() => {
                          router.push(
                            `/dashboard/library?folderId=${folder.id}`
                          );
                          handleFolderListModalClose();
                        }}
                        leftIcon={
                          <FaFolder color={folder.color || "gray.500"} />
                        }
                        _hover={{ bg: "gray.100" }}
                      >
                        {folder.name} ({folder.bookmarkCount})
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Text>No folders available. Create one!</Text>
              )}
              <Button
                mt={4}
                colorScheme="blue"
                width="100%"
                onClick={() => {
                  handleFolderListModalClose();
                  handleFolderModalOpen();
                }}
              >
                Create New Folder
              </Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Flex>
    </FoldersProvider>
  );
};

export default DashboardLayout;
