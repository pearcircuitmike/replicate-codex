// MarkdownTheme.js
import React from "react";
import {
  Text,
  Link,
  UnorderedList,
  OrderedList,
  ListItem,
  Heading,
  Code,
} from "@chakra-ui/react";

const customTheme = {
  p: (props) => {
    const { children } = props;
    return (
      <Text my="15px" fontSize="md" lineHeight="1.45em">
        {children}
      </Text>
    );
  },
  a: (props) => {
    const { children, href } = props;
    const linkText = children?.toString();
    const linkUrl = linkText?.match(/\\\[(.*?)\\\]\((.*?)\)/)?.[2] || href;
    const displayText =
      linkText?.match(/\\\[(.*?)\\\]\((.*?)\)/)?.[1] || linkText;
    return (
      <Link color="blue.500" href={linkUrl}>
        {displayText}
      </Link>
    );
  },
  em: (props) => {
    const { children } = props;
    return (
      <figcaption
        style={{
          textAlign: "center",
          fontStyle: "italic",
          fontSize: "small",
        }}
      >
        {children}
      </figcaption>
    );
  },
  ul: (props) => {
    const { children } = props;
    return (
      <UnorderedList my="18px" lineHeight="1.45em">
        {children}
      </UnorderedList>
    );
  },
  ol: (props) => {
    const { children } = props;
    return (
      <OrderedList my="18px" lineHeight="1.45em">
        {children}
      </OrderedList>
    );
  },
  li: (props) => {
    const { children } = props;
    return (
      <ListItem fontSize="md" my="9px" lineHeight="1.45em">
        {children}
      </ListItem>
    );
  },
  h2: (props) => {
    const { children } = props;
    return (
      <Heading as="h2" size="lg" lineHeight="1.45em">
        {children}
      </Heading>
    );
  },
  h3: (props) => {
    const { children } = props;
    return (
      <Heading as="h3" size="md" lineHeight="1.38em">
        {children}
      </Heading>
    );
  },
  h4: (props) => {
    const { children } = props;
    return (
      <Heading as="h4" size="sm" lineHeight="1.45em">
        {children}
      </Heading>
    );
  },
  code: (props) => {
    const { children } = props;
    return <Code py="0px">{children}</Code>;
  },
};

export default customTheme;
