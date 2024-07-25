import React from "react";
import {
  Box,
  Flex,
  useMediaQuery,
  VStack,
  HStack,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaSearch, FaBook, FaUser, FaNewspaper } from "react-icons/fa";
import TrendingTopics from "../TrendingTopics";
import TopViewedPapers from "../TopViewedPapers";
import TopSearchQueries from "../TopSearchQueries";

const NavItem = ({ icon, label, href }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

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
  const navItems = [
    { icon: <FaSearch />, label: "Discover", href: "/dashboard/discover" },
    {
      icon: <FaNewspaper />,
      label: "Weekly Summary",
      href: "/dashboard/weekly-paper-summary",
    },
    { icon: <FaBook />, label: "My Library", href: "/dashboard/library" },
    { icon: <FaUser />, label: "Profile", href: "/account" },
  ];

  return (
    <Flex direction={{ base: "column", md: "row" }} minHeight="100vh">
      {isLargerThan768 && (
        <Box width="200px" bg="white" py={8}>
          <VStack spacing={4} align="stretch">
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
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
        <Box width="350px">
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
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </HStack>
        </Box>
      )}
    </Flex>
  );
};

export default DashboardLayout;
