import Link from "next/link";
import {
  Heading,
  HStack,
  Flex,
  IconButton,
  Spacer,
  Image,
  VStack,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";

const Navbar = () => {
  const [display, changeDisplay] = useState("none");

  return (
    <nav>
      <Flex p={5}>
        <Flex top="1rem" right="1rem" align="center">
          {/*LOGO*/}
          <Heading fontSize="2xl">
            <Link href="/" aria-label="Home" my={5} w="100%">
              <div>🤖 AIModels.fyi</div>
            </Link>
          </Heading>
        </Flex>
        <Spacer />
        <Flex top="1rem" right="1rem" align="center">
          {/* DESKTOP */}

          <Flex display={["none", "none", "flex", "flex"]}>
            <HStack spacing={10}>
              <Link
                href="https://www.passionfroot.me/replicate-codex"
                aria-label="advertise"
                m={5}
                w="100%"
              >
                Advertise
              </Link>
              <Link href="/creators" aria-label="Creators" m={5} w="100%">
                Creators
              </Link>
              <Link href="/models" aria-label="Models" m={5} w="100%">
                Models
              </Link>
              <Link href="/trending" aria-label="trending" m={5} w="100%">
                🔥 Trending
              </Link>
              <Link
                href="https://notes.aimodels.fyi"
                aria-label="notes"
                m={5}
                w="100%"
              >
                Notes
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
                    🤖 AIModels.fyi
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
            <VStack spacing={3} m={5} fontSize="xl">
              <Link href="/creators" aria-label="creators" m={"10px"} w="100%">
                <span onClick={() => changeDisplay("none")}>Creators</span>
              </Link>
              <Link href="/models" aria-label="models" m={"10px"} w="100%">
                <span onClick={() => changeDisplay("none")}>Models </span>
              </Link>
              <Link href="/trending" aria-label="trending" m={"10px"} w="100%">
                <span onClick={() => changeDisplay("none")}>Trending </span>
              </Link>

              <Link
                href="https://notes.aimodels.fyi"
                aria-label="notes"
                m={"10px"}
                w="100%"
              >
                <span onClick={() => changeDisplay("none")}>Notes</span>
              </Link>
              <Link
                href="https://www.passionfroot.me/replicate-codex"
                aria-label="advertise"
                m={"10px"}
                w="100%"
              >
                <span onClick={() => changeDisplay("none")}>Advertise</span>
              </Link>
            </VStack>
          </Flex>
        </Flex>
      </Flex>
    </nav>
  );
};

export default Navbar;
