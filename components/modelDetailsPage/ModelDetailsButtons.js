import React from "react";
import NextLink from "next/link";
import { Box, Button, Link as ChakraLink } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

const ModelDetailsButtons = ({ model }) => {
  const platform =
    model.platform.charAt(0).toUpperCase() + model.platform.slice(1);

  return (
    <Box my={1}>
      <NextLink href={model.modelUrl} passHref>
        <Button
          colorScheme="blue"
          rightIcon={<ExternalLinkIcon />}
          size="sm"
          mr={2}
          my={1}
        >
          Run on {platform}
        </Button>
      </NextLink>

      {model?.githubUrl && (
        <NextLink href={model.githubUrl} passHref>
          <Button
            colorScheme="gray"
            rightIcon={<ExternalLinkIcon />}
            size="sm"
            mr={2}
            my={1}
          >
            View repo
          </Button>
        </NextLink>
      )}

      {model?.paperUrl && (
        <NextLink href={model.paperUrl} passHref>
          <Button
            colorScheme="gray"
            rightIcon={<ExternalLinkIcon />}
            size="sm"
            mr={2}
            my={1}
          >
            Read paper
          </Button>
        </NextLink>
      )}
    </Box>
  );
};

export default ModelDetailsButtons;
