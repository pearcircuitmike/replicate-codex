import Link from "next/link";
import {
  Heading,
  HStack,
  Flex,
  IconButton,
  Spacer,
  Image,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";

const Navbar = () => {
  const [display, changeDisplay] = useState("none");

  return (
    <nav>
      <Flex
        p={5}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor={"gray.200"}
      >
        <Flex top="1rem" right="1rem" align="center">
          {/*LOGO*/}
          <Heading fontSize="2xl">
            <Link href="/" aria-label="Home" my={5} w="100%">
              <div>🤖 Replicate Codex</div>
            </Link>
          </Heading>
        </Flex>
        <Spacer />
        <Flex top="1rem" right="1rem" align="center">
          {/* DESKTOP */}

          <Flex display={["none", "none", "flex", "flex"]}>
            <HStack spacing={10}>
              <Link href="/link1" aria-label="Countries" m={5} w="100%">
                Link 1
              </Link>
              <Link href="/link2" aria-label="States" m={5} w="100%">
                Link 2
              </Link>
              <Link href="/link3" aria-label="Blog" m={5} w="100%">
                Link3
              </Link>
            </HStack>
          </Flex>

          {/* MOBILE */}
          <IconButton
            aria-label="Open Menu"
            size="lg"
            mr={2}
            icon={<HamburgerIcon />}
            onClick={() => changeDisplay("flex")}
            display={["flex", "flex", "none", "none"]}
          ></IconButton>
        </Flex>

        {/* MOBILE CONTENT */}

        <Flex
          w="100vw"
          display={display}
          bgColor="gray.50"
          zIndex={20}
          h="100vh"
          pos="fixed"
          top="0"
          left="0"
          overflowY="auto"
          flexDir="column"
        >
          <HStack m={5}>
            <Flex top="1rem" align="center">
              {/*LOGO*/}
              <Heading fontSize="2xl">
                <Link href="/" aria-label="Home" my={5} w="100%">
                  <span onClick={() => changeDisplay("none")}>
                    MonkeypoxTracker
                  </span>
                </Link>
              </Heading>
            </Flex>
            <Spacer />
            <Flex>
              <IconButton
                mr={2}
                aria-label="Close Menu"
                size="lg"
                icon={<CloseIcon />}
                onClick={() => changeDisplay("none")}
              ></IconButton>
            </Flex>
          </HStack>
          <Flex flexDir="column" align="center">
            <Link href="/link1" aria-label="link1" m={"10px"} w="100%">
              <span onClick={() => changeDisplay("none")}>Link1</span>
            </Link>
            <Link href="/link2" aria-label="link2" m={"10px"} w="100%">
              <span onClick={() => changeDisplay("none")}>Link2 </span>
            </Link>

            <Link href="/link3" aria-label="link3" m={"10px"} w="100%">
              <span onClick={() => changeDisplay("none")}>Link3 </span>
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </nav>
  );
};

export default Navbar;
