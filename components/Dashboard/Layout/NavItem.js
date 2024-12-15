import React, { useEffect, useState } from "react";
import { Flex, Text, Box } from "@chakra-ui/react";
import Link from "next/link";

const NavItem = ({ icon, label, href, isActive, onClick }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const Content = (
    <Flex
      align="center"
      p={2}
      mx={2}
      borderRadius="lg"
      justify={label ? "left" : "center"}
      role="group"
      cursor="pointer"
      bg={isActive ? "blue.50" : "transparent"}
      color={isActive ? "blue.500" : "gray.600"}
      _hover={{ bg: "blue.50" }}
      onClick={onClick} // Attach click handler if provided
    >
      <Box
        boxSize="24px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {icon}
      </Box>
      {label && ( // Render text and margin only if label exists
        <Text ml={4}>{label}</Text>
      )}
    </Flex>
  );

  return href ? (
    <Link href={href} passHref>
      {Content}
    </Link>
  ) : (
    Content // Render plain content if no href is provided
  );
};

export default NavItem;
