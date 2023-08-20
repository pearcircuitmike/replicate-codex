import Link from "next/link";
import {
  Heading,
  HStack,
  VStack,
  Flex,
  IconButton,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useRouter } from "next/router";
import { SearchIcon } from "@chakra-ui/icons";

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
          <Heading fontSize="2xl">
            <Link href="/" aria-label="Home">
              <div>🤖 AIModels.fyi</div>
            </Link>
          </Heading>
        </Box>

        <Box flex="1" maxW="600px" mx="auto">
          <form onSubmit={handleSearchSubmit}>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input type="text" name="query" placeholder="Quick Search..." />
            </InputGroup>
          </form>
        </Box>

        <HStack spacing={10} display={["none", "none", "flex", "flex"]}>
          <Link
            href="https://www.passionfroot.me/replicate-codex"
            aria-label="advertise"
          >
            Advertise
          </Link>
          <Link href="/creators" aria-label="Creators">
            Creators
          </Link>
          <Link href="/models" aria-label="Models">
            Models
          </Link>
          <Link href="/trending" aria-label="trending">
            🔥 Trending
          </Link>
          <Link href="https://notes.aimodels.fyi" aria-label="guides">
            Guides
          </Link>
          <IconButton
            aria-label="Open Menu"
            size="lg"
            icon={<HamburgerIcon />}
            onClick={() => changeDisplay("flex")}
            display={["flex", "flex", "none", "none"]}
          />
        </HStack>
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
              <Link href="/" aria-label="Home">
                <span onClick={() => changeDisplay("none")}>
                  🤖 AIModels.fyi
                </span>
              </Link>
            </Heading>
          </Flex>
          <IconButton
            mr={2}
            aria-label="Close Menu"
            size="lg"
            icon={<CloseIcon />}
            onClick={() => changeDisplay("none")}
          />
        </HStack>
        <Flex flexDir="column" align="center">
          <VStack spacing={3} m={5} fontSize="xl">
            <Link href="/creators" aria-label="creators">
              <span onClick={() => changeDisplay("none")}>Creators</span>
            </Link>
            <Link href="/models" aria-label="models">
              <span onClick={() => changeDisplay("none")}>Models</span>
            </Link>
            <Link href="/trending" aria-label="trending">
              <span onClick={() => changeDisplay("none")}>Trending</span>
            </Link>
            <Link href="https://notes.aimodels.fyi" aria-label="guides">
              <span onClick={() => changeDisplay("none")}>Guides</span>
            </Link>
            <Link
              href="https://www.passionfroot.me/replicate-codex"
              aria-label="advertise"
            >
              <span onClick={() => changeDisplay("none")}>Advertise</span>
            </Link>
          </VStack>
        </Flex>
      </Flex>
    </nav>
  );
};

export default Navbar;
