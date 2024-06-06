import Link from "next/link";
import {
  Heading,
  HStack,
  Flex,
  IconButton,
  Spacer,
  VStack,
  Box,
  Button,
  Avatar,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [display, changeDisplay] = useState("none");
  const { user, logout } = useAuth();

  return (
    <nav>
      <Flex p={5} justify="space-between" align="center">
        <Box>
          <Flex top="1rem" right="1rem" align="center">
            <Heading fontSize="2xl">
              <Link href="/" aria-label="Home" legacyBehavior>
                <div>🤖 AIModels.fyi</div>
              </Link>
            </Heading>
          </Flex>
        </Box>

        <Flex top="1rem" right="1rem" align="center">
          <Flex display={["none", "none", "flex", "flex"]}>
            <HStack spacing={10}>
              <Link
                href="https://www.passionfroot.me/replicate-codex"
                aria-label="Advertise"
                m={5}
                w="100%"
              >
                📣 Advertise
              </Link>
              <Link href="/creators" aria-label="Creators" m={5} w="100%">
                👨‍🎨 Creators
              </Link>
              <Link href="/models" aria-label="Models" m={5} w="100%">
                🤖 Models
              </Link>
              <Link href="/papers" aria-label="Papers" m={5} w="100%">
                📄 Papers
              </Link>
              <Link href="/authors" aria-label="Science" m={5} w="100%">
                🔬 Researchers
              </Link>
              <Link href="/trending" aria-label="Trending" m={5} w="100%">
                🔥 Trending
              </Link>
              <Link href="/tools" aria-label="Tools" m={5} w="100%">
                🛠️ Tools
              </Link>
              <Link
                href="https://notes.aimodels.fyi"
                aria-label="Notes"
                m={5}
                w="100%"
              >
                📝 Notes
              </Link>
              {user ? (
                <Menu>
                  <MenuButton>
                    <Flex align="center">
                      <Avatar
                        size="sm"
                        name={user.user_metadata.full_name}
                        src={user.user_metadata.avatar_url}
                        mr={2}
                      />
                      <Text>{user.user_metadata.full_name}</Text>
                    </Flex>
                  </MenuButton>
                  <MenuList>
                    <MenuItem as={Link} href="/dashboard">
                      Dashboard
                    </MenuItem>
                    <MenuItem as={Link} href="/account">
                      My Account
                    </MenuItem>
                    <MenuItem onClick={logout}>Log Out</MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Button as="a" href="/login" colorScheme="blue">
                  Sign in / sign up
                </Button>
              )}
            </HStack>
          </Flex>
          <IconButton
            aria-label="Open Menu"
            size="lg"
            mr={2}
            icon={<HamburgerIcon />}
            onClick={() => changeDisplay("flex")}
            display={["flex", "flex", "none", "none"]}
          ></IconButton>
        </Flex>

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
              <Heading fontSize="2xl">
                <Link href="/" aria-label="Home" my={5} legacyBehavior>
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
          {user && (
            <>
              <Flex align="center" flexDir="column" mb={4}>
                <Avatar
                  size="lg"
                  name={user.user_metadata.full_name}
                  src={user.user_metadata.avatar_url}
                  mb={2}
                />
                <Text fontSize="xl">{user.user_metadata.full_name}</Text>
              </Flex>
              <Divider />
            </>
          )}
          <Flex flexDir="column" align="center">
            <VStack spacing={3} m={5} fontSize="xl">
              <Link
                href="/creators"
                aria-label="Creators"
                m={"10px"}
                w="100%"
                legacyBehavior
              >
                <span onClick={() => changeDisplay("none")}>👨‍🎨 Creators</span>
              </Link>
              <Link
                href="/models"
                aria-label="Models"
                m={"10px"}
                w="100%"
                legacyBehavior
              >
                <span onClick={() => changeDisplay("none")}>🤖 Models</span>
              </Link>
              <Link
                href="/papers"
                aria-label="Papers"
                m={"10px"}
                w="100%"
                legacyBehavior
              >
                <span onClick={() => changeDisplay("none")}>📄 Papers</span>
              </Link>
              <Link
                href="/authors"
                aria-label="Researchers"
                m={"10px"}
                w="100%"
                legacyBehavior
              >
                <span onClick={() => changeDisplay("none")}>
                  🔬 Researchers
                </span>
              </Link>
              <Link
                href="/trending"
                aria-label="Trending"
                m={"10px"}
                w="100%"
                legacyBehavior
              >
                <span onClick={() => changeDisplay("none")}>🔥 Trending</span>
              </Link>
              <Link
                href="/tools"
                aria-label="Tools"
                m={"10px"}
                w="100%"
                legacyBehavior
              >
                <span onClick={() => changeDisplay("none")}>🛠️ Tools</span>
              </Link>
              <Link
                href="https://notes.aimodels.fyi"
                aria-label="Notes"
                m={"10px"}
                w="100%"
                legacyBehavior
              >
                <span onClick={() => changeDisplay("none")}>📝 Notes</span>
              </Link>
              <Link
                href="https://www.passionfroot.me/replicate-codex"
                aria-label="Advertise"
                m={"10px"}
                w="100%"
                legacyBehavior
              >
                <span onClick={() => changeDisplay("none")}>📣 Advertise</span>
              </Link>
              {user && (
                <>
                  <Link
                    href="/dashboard"
                    aria-label="Dashboard"
                    m={"10px"}
                    w="100%"
                    legacyBehavior
                  >
                    <span onClick={() => changeDisplay("none")}>
                      📊 Dashboard
                    </span>
                  </Link>
                  <Link
                    href="/account"
                    aria-label="My Account"
                    m={"10px"}
                    w="100%"
                    legacyBehavior
                  >
                    <span onClick={() => changeDisplay("none")}>
                      👤 My Account
                    </span>
                  </Link>
                  <Button
                    onClick={() => {
                      logout();
                      changeDisplay("none");
                    }}
                    colorScheme="blue"
                    leftIcon="🚪"
                    m={"10px"}
                    w="100%"
                  >
                    Log Out
                  </Button>
                </>
              )}
              {!user && (
                <Button
                  as="a"
                  href="/login"
                  colorScheme="blue"
                  m={"10px"}
                  w="100%"
                >
                  Sign in / sign up
                </Button>
              )}
            </VStack>
          </Flex>
        </Flex>
      </Flex>
    </nav>
  );
};

export default Navbar;
