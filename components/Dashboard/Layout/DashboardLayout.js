// /components/Dashboard/Layout/DashboardLayout.js
import React, { useState } from "react";
import { Box, Flex, useMediaQuery, VStack, Tooltip } from "@chakra-ui/react";
import { useRouter } from "next/router";
import {
  FaSearch,
  FaBookmark,
  FaChartLine,
  FaFlask,
  FaCubes,
  FaStar,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaUsers, // <-- NEW import for Communities icon
} from "react-icons/fa";
import NavItem from "./NavItem";

const DashboardLayout = ({ children }) => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  // Updated navItems array with a "Communities" link
  const navItems = [
    { icon: <FaStar />, label: "Following", href: "/dashboard/followed-tasks" },
    {
      icon: <FaChartLine />,
      label: "Trending Topics",
      href: "/dashboard/trending",
    },
    { icon: <FaSearch />, label: "Discover", href: "/dashboard/discover" },
    {
      icon: <FaUsers />,
      label: "Communities",
      href: "/dashboard/communities", // <-- NEW link
    },
    {
      icon: <FaFlask />,
      label: "Popular Papers",
      href: "/dashboard/weekly-papers-summary",
    },
    {
      icon: <FaCubes />,
      label: "Popular Models",
      href: "/dashboard/weekly-models-summary",
    },
    { icon: <FaBookmark />, label: "Bookmarks", href: "/dashboard/bookmarks" },
  ];

  return (
    <Flex direction={{ base: "column", md: "row" }} minHeight="100vh">
      {/* Sidebar for larger screens */}
      {isLargerThan768 && (
        <Box
          width={isCollapsed ? "72px" : "300px"}
          py={8}
          overflowY="auto"
          borderRight="1px solid #e2e8f0"
          transition="all 0.2s"
        >
          <VStack spacing={1} align="stretch" mt={12}>
            {navItems.map((item) => (
              <Box key={item.href}>
                {isCollapsed ? (
                  <Tooltip
                    label={item.label}
                    placement="right"
                    hasArrow
                    zIndex="tooltip"
                  >
                    <Box>
                      <NavItem
                        icon={item.icon}
                        href={item.href}
                        isActive={router.pathname === item.href}
                      />
                    </Box>
                  </Tooltip>
                ) : (
                  <NavItem
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    isActive={router.pathname === item.href}
                  />
                )}
              </Box>
            ))}
          </VStack>

          {/* Collapse/Expand Toggle */}
          <Box mt={8}>
            <NavItem
              label={!isCollapsed && " "} // spacing hack
              icon={
                isCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />
              }
              onClick={() => setIsCollapsed(!isCollapsed)}
            />
          </Box>
        </Box>
      )}

      {/* Main Content */}
      <Box flex={1} overflowY="auto" p={4} transition="all 0.2s">
        {children}
      </Box>

      {/* Mobile Footer Nav */}
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
          px={4}
        >
          {navItems.map((item) => (
            <Box
              key={item.href}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flex="1"
            >
              <NavItem
                icon={item.icon}
                href={item.href}
                isActive={router.pathname === item.href}
              />
            </Box>
          ))}
        </Box>
      )}
    </Flex>
  );
};

export default DashboardLayout;
