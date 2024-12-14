import React from "react";
import {
  Box,
  Flex,
  useMediaQuery,
  VStack,
  Grid,
  GridItem,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import {
  FaSearch,
  FaBookmark,
  FaChartLine,
  FaFlask,
  FaCubes,
  FaStar,
} from "react-icons/fa";
import NavItem from "./NavItem";

const DashboardLayout = ({ children }) => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const router = useRouter();

  const navItems = [
    { icon: <FaStar />, label: "Following", href: "/dashboard/followed-tasks" },
    {
      icon: <FaChartLine />,
      label: "Trending Topics",
      href: "/dashboard/trending",
    },
    { icon: <FaSearch />, label: "Discover", href: "/dashboard/discover" },
    {
      icon: <FaFlask />,
      label: "Hot Papers",
      href: "/dashboard/weekly-papers-summary",
    },
    {
      icon: <FaCubes />,
      label: "Hot Models",
      href: "/dashboard/weekly-models-summary",
    },
    { icon: <FaBookmark />, label: "Bookmarks", href: "/dashboard/bookmarks" },
  ];

  return (
    <Flex direction={{ base: "column", md: "row" }} minHeight="100vh">
      {/* Sidebar for larger screens */}
      {isLargerThan768 && (
        <Box
          width="300px"
          py={8}
          overflowY="auto"
          borderRight="1px solid #e2e8f0"
        >
          <VStack spacing={4} align="stretch">
            {navItems.map((item, index) => (
              <NavItem
                key={item.href || index}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={router.pathname === item.href}
              />
            ))}
          </VStack>
        </Box>
      )}

      {/* Main Content */}
      <Box flex={1} overflowY="auto" p={4}>
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
          boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
          height="64px"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          paddingX={4}
        >
          {navItems.map((item, index) => (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flex="1"
            >
              {/* Icon only — matches desktop styles */}
              <Box
                as="button"
                onClick={() => router.push(item.href)}
                fontSize="lg"
                color="gray.500"
                _hover={{ color: "gray.600" }} // Matches desktop hover behavior
                aria-label={item.label} // For accessibility
              >
                {item.icon}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Flex>
  );
};

export default DashboardLayout;
