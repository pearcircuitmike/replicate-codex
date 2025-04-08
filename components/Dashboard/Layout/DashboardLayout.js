import React, { useState } from "react";
import {
  Box,
  Flex,
  useMediaQuery,
  VStack,
  Tooltip,
  Badge,
  keyframes,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import {
  FaBookmark,
  FaChartLine,
  FaFlask,
  FaCubes,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaUsers,
  FaRobot,
  FaHighlighter,
} from "react-icons/fa";
import NavItem from "./NavItem";
import { useAuth } from "@/context/AuthContext";

// Keyframes for a subtle sheen animation
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const DashboardLayout = ({ children }) => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const { hasActiveSubscription } = useAuth();

  function getNavLabel(originalLabel) {
    // Show "NEW" badge on the Assistant label
    if (originalLabel === "Assistant") {
      return (
        <>
          {originalLabel}
          <Badge
            ml={2}
            fontSize="0.6em"
            position="relative"
            color="white"
            borderRadius="md"
            px={1}
            py={0.5}
            bgGradient="linear(to-r, yellow.400, orange.400)"
            bgSize="200% auto"
            animation={`${shimmer} 5s linear infinite`}
            boxShadow="0 0 4px rgba(255,165,0,0.6), inset 0 0 2px rgba(255,255,255,0.7)"
            _before={{
              content: `"✨"`,
              position: "absolute",
              top: "-4px",
              right: "-8px",
            }}
            _after={{
              content: `"✨"`,
              position: "absolute",
              bottom: "-4px",
              left: "-8px",
            }}
          >
            NEW
          </Badge>
        </>
      );
    }

    // Show "PRO" badge for certain labels if unsubscribed
    const isProFeature =
      originalLabel === "Popular Papers" || originalLabel === "Popular Models";
    if (!hasActiveSubscription && isProFeature) {
      return (
        <>
          {originalLabel}{" "}
          <Badge ml={1} colorScheme="blue" fontSize="0.6em">
            PRO
          </Badge>
        </>
      );
    }

    return originalLabel;
  }

  const navItems = [
    {
      icon: <FaUsers />,
      label: "Communities",
      href: "/dashboard/communities",
    },
    {
      icon: <FaRobot />,
      label: "Assistant",
      href: "/dashboard/assistant",
    },
    {
      icon: <FaChartLine />,
      label: "Trending Topics",
      href: "/dashboard/trending",
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
    {
      icon: <FaHighlighter />,
      label: "Highlights",
      href: "/dashboard/highlights",
    },
  ];

  return (
    <Flex direction={{ base: "column", md: "row" }} minHeight="100vh">
      {isLargerThan768 && (
        <Box
          width={isCollapsed ? "72px" : "300px"}
          py={8}
          overflowY="auto"
          borderRight="1px solid #e2e8f0"
          transition="all 0.2s"
        >
          <VStack spacing={1} align="stretch" mt={12}>
            {navItems.map((item) => {
              const finalLabel = getNavLabel(item.label);
              const isActive = router.pathname === item.href;
              return (
                <Box key={item.href}>
                  {isCollapsed ? (
                    <Tooltip label={item.label} placement="right" hasArrow>
                      <Box>
                        <NavItem
                          icon={item.icon}
                          href={item.href}
                          isActive={isActive}
                        />
                      </Box>
                    </Tooltip>
                  ) : (
                    <NavItem
                      icon={item.icon}
                      label={finalLabel}
                      href={item.href}
                      isActive={isActive}
                    />
                  )}
                </Box>
              );
            })}
          </VStack>

          <Box mt={8}>
            <NavItem
              label={!isCollapsed && " "}
              icon={
                isCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />
              }
              onClick={() => setIsCollapsed(!isCollapsed)}
            />
          </Box>
        </Box>
      )}

      <Box flex={1} overflowY="auto" p={4} transition="all 0.2s">
        {children}
      </Box>

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
          {navItems.map((item) => {
            const finalLabel = getNavLabel(item.label);
            const isActive = router.pathname === item.href;
            return (
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
                  isActive={isActive}
                />
              </Box>
            );
          })}
        </Box>
      )}
    </Flex>
  );
};

export default DashboardLayout;
