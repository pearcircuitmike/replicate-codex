import React, { useEffect, useRef } from "react";
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Flex,
  useDisclosure,
  useBreakpointValue,
  Center,
} from "@chakra-ui/react";

// Custom Image component with modal functionality
const EnhancedImage = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Responsive styling based on screen size
  const imageWidth = useBreakpointValue({ base: "100%", md: "120%" });
  const imageTransform = useBreakpointValue({
    base: "none",
    md: "translateX(-10%)",
  });
  return (
    <>
      {/* Use a span element instead of div/Box to avoid hydration errors in paragraphs */}
      <Image
        src={props.src}
        alt={props.alt || ""}
        width={imageWidth}
        display="block"
        cursor="zoom-in"
        borderRadius="4px"
        marginY="3em"
        transition="all 0.3s ease"
        style={{
          transform: imageTransform,
        }}
        _hover={{
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
          transform: useBreakpointValue({
            base: "translateY(-2px)",
            md: "translateX(-10%) translateY(-2px)",
          }),
        }}
        onClick={onOpen}
        {...props}
      />
      <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
        <ModalContent
          bg="transparent"
          boxShadow="none"
          maxW="100vw"
          maxH="100vh"
          m={0}
        >
          <ModalCloseButton
            color="white"
            bg="blackAlpha.600"
            borderRadius="full"
            size="lg"
            m={4}
            zIndex="modal"
          />
          <ModalBody
            p={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="100vw"
            height="100vh"
          >
            <Flex
              justifyContent="center"
              alignItems="center"
              width="100%"
              height="100%"
              p={8}
            >
              <Image
                src={props.src}
                alt={props.alt || ""}
                maxH="90vh"
                maxW="90vw"
                objectFit="contain"
                borderRadius="md"
                cursor="zoom-out"
                onClick={onClose}
              />
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

// Load KaTeX script and CSS once
const loadKaTeX = () => {
  if (typeof window === "undefined") return;

  // Add KaTeX CSS if not already added
  if (!document.getElementById("katex-css")) {
    const link = document.createElement("link");
    link.id = "katex-css";
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.css";
    document.head.appendChild(link);
  }

  // Add KaTeX script if not already added
  if (!window.katex && !document.getElementById("katex-js")) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.id = "katex-js";
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.js";
      script.async = true;
      script.onload = resolve;
      document.body.appendChild(script);
    });
  }

  return Promise.resolve();
};

// Math equation component
const MathEquation = ({ tex }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const renderEquation = async () => {
      await loadKaTeX();

      if (containerRef.current && window.katex) {
        try {
          window.katex.render(tex, containerRef.current, {
            displayMode: true,
            throwOnError: false,
          });
        } catch (error) {
          console.error("Error rendering equation:", error);
          containerRef.current.textContent = `[Error rendering: ${tex}]`;
        }
      }
    };

    renderEquation();
  }, [tex]);

  return (
    <Center my={4}>
      <Box ref={containerRef} />
    </Center>
  );
};

// Process content to find and replace equations
const processContent = (content) => {
  if (!content || typeof content !== "string") return content;

  const segments = [];
  let lastIndex = 0;
  const regex = /\$\$(.*?)\$\$/gs;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Add text before the equation
    if (match.index > lastIndex) {
      segments.push(content.substring(lastIndex, match.index));
    }

    // Add the equation component
    segments.push(<MathEquation key={match.index} tex={match[1]} />);

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text
  if (lastIndex < content.length) {
    segments.push(content.substring(lastIndex));
  }

  return segments;
};

// Enhanced paragraph with math equation support
const EnhancedParagraph = (props) => {
  let processedChildren = [];

  React.Children.forEach(props.children, (child) => {
    if (typeof child === "string") {
      const processed = processContent(child);
      if (Array.isArray(processed)) {
        processedChildren = [...processedChildren, ...processed];
      } else {
        processedChildren.push(processed);
      }
    } else {
      processedChildren.push(child);
    }
  });

  return (
    <Text
      fontFamily="Inter"
      fontSize="18px"
      color="#000"
      lineHeight="27px"
      mb="1.25em"
      sx={{ WebkitFontSmoothing: "antialiased" }}
    >
      {processedChildren}
    </Text>
  );
};

const customTheme = {
  // Paragraph text
  p: (props) => <EnhancedParagraph {...props} />,

  // Links using Chakra UI's blue color scheme with normal underlining
  a: (props) => (
    <Link
      color="blue.500"
      textDecoration="underline"
      _hover={{ color: "blue.600", textDecoration: "underline" }}
      _active={{ color: "blue.700", textDecoration: "underline" }}
      _visited={{ color: "purple.500", textDecoration: "underline" }}
      sx={{
        textDecoration: "underline !important",
        "&:hover": { textDecoration: "underline !important" },
      }}
      fontWeight="normal"
      {...props}
    >
      {props.children}
    </Link>
  ),

  // Images with hover shadow effects and click-to-enlarge functionality
  img: (props) => <EnhancedImage {...props} />,

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
