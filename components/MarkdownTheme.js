import React from "react";
import {
  Text,
  Link,
  UnorderedList,
  OrderedList,
  ListItem,
  Heading,
  Code,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
} from "@chakra-ui/react";

const customTheme = {
  // Paragraph text
  p: (props) => (
    <Text
      fontFamily="Inter"
      fontSize="18px"
      color="#000"
      lineHeight="27px"
      mb="1.25em"
      sx={{ WebkitFontSmoothing: "antialiased" }}
    >
      {props.children}
    </Text>
  ),
  // Links using site's blue color from screenshot (#0060df)
  a: (props) => (
    <Link
      color="#0060df"
      textDecoration="none"
      _hover={{ color: "#0250bb", textDecoration: "none" }}
      _active={{ backgroundColor: "rgba(0,0,0,0.05)" }}
      _visited={{ color: "#b833e1" }}
      fontWeight="normal"
      {...props}
    >
      {props.children}
    </Link>
  ),
  // Images with full-width styling that extends beyond text margins
  img: (props) => (
    <Image
      src={props.src}
      alt={props.alt || ""}
      width="112%"
      marginLeft="-6%"
      marginY="3em"
      borderRadius="2px"
      display="block"
      {...props}
    />
  ),
  // Unordered list styling
  ul: (props) => (
    <UnorderedList
      fontFamily="Inter"
      fontSize="18px"
      color="#000"
      lineHeight="27px"
      mb="1.25em"
      ml="32px"
      {...props}
    />
  ),
  // Ordered list styling
  ol: (props) => (
    <OrderedList
      fontFamily="Inter"
      fontSize="18px"
      color="#000"
      lineHeight="27px"
      mb="1.25em"
      ml="32px"
      {...props}
    />
  ),
  // List item styling
  li: (props) => (
    <ListItem
      fontFamily="Inter"
      fontSize="18px"
      color="#000"
      mb="0.25em"
      {...props}
    />
  ),
  // h1 styling
  h1: (props) => (
    <Heading
      as="h1"
      fontFamily="Inter"
      fontSize="40px"
      lineHeight="44px"
      fontWeight="700"
      color="#000"
      mb="0.25em"
      {...props}
    />
  ),
  // h2 styling
  h2: (props) => (
    <Heading
      as="h2"
      fontFamily="Inter"
      fontSize="32px"
      lineHeight="36px"
      fontWeight="700"
      color="#000"
      mb="0.45em"
      mt="1em"
      {...props}
    />
  ),
  // h3 styling
  h3: (props) => (
    <Heading
      as="h3"
      fontFamily="Inter"
      fontSize="24px"
      lineHeight="28px"
      fontWeight="700"
      color="#000"
      mb="0.5em"
      mt="1em"
      {...props}
    />
  ),
  // h4 styling
  h4: (props) => (
    <Heading
      as="h4"
      fontFamily="Inter"
      fontSize="20px"
      lineHeight="24px"
      fontWeight="700"
      color="#000"
      mb="0.5em"
      mt="1em"
      {...props}
    />
  ),
  // Blockquotes with site styling
  blockquote: (props) => (
    <Box
      as="blockquote"
      fontFamily="Inter"
      borderLeft="5px solid"
      borderColor="#ededf0"
      fontWeight="700"
      fontSize="18px"
      pl="24px"
      color="#000"
      mb="24px"
      {...props}
    />
  ),
  // Horizontal rule
  hr: (props) => (
    <Box
      as="hr"
      border="0 solid #ededf0"
      borderTopWidth="4px"
      my="1.25em"
      {...props}
    />
  ),
  // Inline code styling
  code: (props) => <Code fontFamily="Inter" fontSize="inherit" {...props} />,
  // Preformatted blocks
  pre: (props) => (
    <Box
      as="pre"
      fontFamily="Inter"
      overflowX="auto"
      p="1em"
      borderRadius="2px"
      mb="1.25em"
      {...props}
    />
  ),
  // Table styling based on the example image
  table: (props) => (
    <Table
      fontFamily="Inter"
      fontSize="18px"
      color="#000"
      width="100%"
      borderCollapse="collapse"
      border="1px solid #d9d9d9"
      my="3em"
      {...props}
    />
  ),
  thead: (props) => <Thead backgroundColor="#ffffff" {...props} />,
  tbody: (props) => <Tbody {...props} />,
  tr: (props) => <Tr borderBottom="1px solid #d9d9d9" {...props} />,
  th: (props) => (
    <Th
      border="1px solid #d9d9d9"
      padding="16px"
      textAlign="left"
      fontFamily="Inter"
      fontSize="18px"
      fontWeight="700"
      color="#000"
      textTransform="none"
      {...props}
    />
  ),
  td: (props) => (
    <Td
      border="1px solid #d9d9d9"
      padding="16px"
      textAlign="left"
      fontFamily="Inter"
      fontSize="18px"
      verticalAlign="top"
      {...props}
    />
  ),
};

export default customTheme;
