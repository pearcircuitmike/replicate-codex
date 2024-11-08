import React, { useEffect, useRef } from "react";
import {
  Slide,
  Box,
  useDisclosure,
  IconButton,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

const AuthSlideTray = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue("white", "gray.800");
  const sessionStorageKey = "authSlideTrayShown";
  const debounceTimeout = useRef(null);

  useEffect(() => {
    const hasTrayBeenShown = () => {
      return sessionStorage.getItem(sessionStorageKey) === "true";
    };

    const setTrayShown = () => {
      sessionStorage.setItem(sessionStorageKey, "true");
    };

    const handleScroll = () => {
      if (hasTrayBeenShown()) return;

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        const scrollPercentage =
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100;

        if (scrollPercentage >= 10) {
          setTrayShown();
          onOpen();
        }
      }, 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [onOpen]);

  return (
    <>
      {isOpen && (
        <>
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            zIndex={9}
            onClick={onClose}
          />
          <Slide direction="bottom" in={isOpen} style={{ zIndex: 10 }}>
            <Box
              p={6}
              bg={bgColor}
              boxShadow="xl"
              borderTopRadius="lg"
              borderTop="1px"
              borderColor="gray.200"
            >
              <Flex direction="column" align="center" justify="center">
                <IconButton
                  icon={<CloseIcon />}
                  position="absolute"
                  right={2}
                  top={2}
                  size="sm"
                  onClick={onClose}
                  aria-label="Close auth form"
                  variant="ghost"
                  _hover={{ bg: "gray.100" }}
                />
                <Box pt={8} width="100%" maxWidth="400px">
                  {children}
                </Box>
              </Flex>
            </Box>
          </Slide>
        </>
      )}
    </>
  );
};

export default AuthSlideTray;
