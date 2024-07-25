// Sidebar.js
import React from "react";
import {
  Box,
  VStack,
  Text,
  Icon,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import { FaSearch, FaBook } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/router";

const SidebarItem = ({ icon, text, href, onClick }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link href={href} passHref>
      <Box
        display="flex"
        alignItems="center"
        p={2}
        bg={isActive ? "gray.50" : "transparent"}
        _hover={{ bg: "gray.50" }}
        cursor="pointer"
        onClick={onClick}
      >
        <Icon as={icon} mr={2} />
        <Text>{text}</Text>
      </Box>
    </Link>
  );
};

const Sidebar = ({ isOpen, onClose, ...props }) => {
  const sidebarContent = (
    <VStack spacing={0} align="stretch">
      <SidebarItem
        icon={FaSearch}
        text="Discover"
        href="/dashboard/discover"
        onClick={onClose}
      />
      <SidebarItem
        icon={FaBook}
        text="My Library"
        href="/dashboard/library"
        onClick={onClose}
      />
    </VStack>
  );

  return (
    <>
      <Box
        width="200px"
        bg="white"
        boxShadow="md"
        height="100%"
        display={{ base: "none", md: "block" }}
        {...props}
      >
        {sidebarContent}
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
        <DrawerOverlay>
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Menu</DrawerHeader>
            <DrawerBody>{sidebarContent}</DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  );
};

export default Sidebar;
