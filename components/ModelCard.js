import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Avatar,
  Link as ChakraLink,
  HStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { formatLargeNumber } from "@/utils/formatLargeNumber";
import { toTitleCase } from "@/utils/toTitleCase";

const ModelCard = ({ model }) => {
  if (!model) {
    return (
      <Box
        w="100%"
        h="100%"
        p={4}
        bgColor="gray.100"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text>No model data available.</Text>
      </Box>
    );
  } else {
    return (
      <Box
        w="100%"
        h="100%"
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="base"
        bgColor="gray.100"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box
          bgImage={`url(${
            model.example ||
            "https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png"
          })`}
          bgPosition="center"
          bgSize="cover"
          bgRepeat="no-repeat"
          width="100%"
          height="200px"
          mb="10px"
        ></Box>
        <Box p="15px">
          <Heading
            as="h3"
            size="md"
            noOfLines={2}
            mb={2}
            style={{ whiteSpace: "normal", wordWrap: "break-word" }}
          >
            {model.modelName}
          </Heading>

          <Flex mb="10px" alignItems="center">
            <Avatar
              src={`https://github.com/${model.creator}.png`}
              size="xs"
              onClick={() =>
                window.open(`/creators/${model.platform}/${model.creator}`)
              }
              cursor="pointer"
            />
            <Link href={`/creators/${model.platform}/${model.creator}`}>
              <ChakraLink
                ml={2}
                color="blue.500"
                textDecoration="underline"
                fontSize="sm"
              >
                {model.creator}
              </ChakraLink>
            </Link>
          </Flex>

          <Text fontSize="sm" noOfLines={4}>
            {model?.description || "No description provided."}
          </Text>
          <Text>
            <Link href={`/models/${model?.platform}/${model?.id}`} passHref>
              <ChakraLink
                fontSize="sm"
                color="blue.500"
                textDecoration="underline"
              >
                Read more
              </ChakraLink>
            </Link>
          </Text>
        </Box>

        <HStack
          justify="space-between"
          mt="auto"
          mb="10px"
          spacing={6}
          pl="15px"
          pr="15px"
        >
          <Text fontSize="sm">
            {model.costToRun ? `$${model.costToRun}/run` : "$-/run"}
          </Text>
          <Text fontSize="sm">{formatLargeNumber(model.downloads)}</Text>
          <Text fontSize="sm" textAlign="right">
            {toTitleCase(model.platform)}
          </Text>
        </HStack>
      </Box>
    );
  }
};

export default ModelCard;
