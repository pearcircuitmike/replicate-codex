// components/dashboard/NavItem.js

import React, { useEffect, useState } from "react";
import { Flex, Text } from "@chakra-ui/react";
import Link from "next/link";

const NavItem = ({ icon, label, href, isActive }) => {
  const [isMounted, setIsMounted] = useState(false);

  // Use effect to track when the component is mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Render nothing on the server-side to avoid mismatches
    return null;
  }

  return (
    <Link href={href} passHref>
      <Flex
        as="a"
        align="center"
        p={2}
        mx={2}
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? "blue.50" : "transparent"}
        color={isActive ? "blue.500" : "gray.600"}
        _hover={{ bg: "blue.50" }}
      >
        {icon}
        <Text ml={4} display={{ base: "none", md: "block" }}>
          {label}
        </Text>
      </Flex>
    </Link>
  );
};

export default NavItem;
