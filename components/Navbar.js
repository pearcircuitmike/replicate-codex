// Navbar.js
import Link from "next/link";
import {
  Heading,
  HStack,
  Flex,
  IconButton,
  Spacer,
  Input,
  VStack,
  Box,
  InputGroup,
  InputLeftElement,
  Button,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, SearchIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useRouter } from "next/router";

const Navbar = () => {
  const [display, changeDisplay] = useState("none");
  const router = useRouter();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = e.target.query.value;
    router.push(`/results?query=${encodeURIComponent(query)}`);
  };

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

        <Box
          flex="1"
          maxW="600px"
          mx="auto"
          display={["none", "none", "flex", "flex"]}
        >
          {/* <Box flex="1" maxW="600px" mx={5}>
            <form onSubmit={handleSearchSubmit}>
              <InputGroup size="md">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
               <Input type="text" name="query" placeholder="Quick Search..." /> 
              </InputGroup>
            </form>
          </Box>*/}
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
              <Button
                as="a"
                href="https://bit.ly/48UUjKl"
                target="_blank"
                colorScheme="blue"
                leftIcon="📩"
              >
                Submit
              </Button>
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
              <Button
                as="a"
                href="https://bit.ly/48UUjKl"
                target="_blank"
                colorScheme="blue"
                leftIcon="📩"
                m={"10px"}
                w="100%"
              >
                Submit
              </Button>
            </VStack>
          </Flex>
        </Flex>
      </Flex>
    </nav>
  );
};

export default Navbar;
