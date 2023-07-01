import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Avatar,
  Tag,
  Button,
  HStack,
} from "@chakra-ui/react";
import Link from "next/link";
import calculateModelRank from "../utils/calculateModelRank";
import { formatLargeNumber } from "@/utils/formatLargeNumber";

const ModelCard = ({ model, allModels }) => {
  const rank = calculateModelRank(allModels, model?.id);

  if (!model) {
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        w="100%"
        boxShadow="base"
        p={4}
        height="100%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Text>No model data available.</Text>
      </Box>
    );
  } else {
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        w="100%"
        boxShadow="base"
        p={4}
        height="100%"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box>
          <Link href={`/models/${model?.platform}/${model?.id}`} passHref>
            <Box cursor="pointer">
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
                mb={3}
              ></Box>
            </Box>
          </Link>
          <Heading as="h2" size="md" isTruncated mb={2}>
            {model.modelName}
          </Heading>
          <HStack spacing={2} mb={2}>
            <Avatar
              src={`https://github.com/${model.creator}.png`}
              size="sm"
              onClick={() =>
                window.open(`/creators/${model.platform}/${model.creator}`)
              }
              cursor="pointer"
            />
            <Link href={`/creators/${model.platform}/${model.creator}`}>
              <Text textDecoration="underline" color="blue.500">
                {model.creator}
              </Text>
            </Link>
          </HStack>
          {model?.tags.split(",")?.map((tag, index) => (
            <Tag key={index} mr={1} mb={1}>
              {tag.trim()}
            </Tag>
          ))}
          <Text fontSize="sm" noOfLines={3} mb={3}>
            {model?.description || "No description provided."}
          </Text>
        </Box>
        <HStack justify="space-between" mb={3}>
          <Box>
            <Text fontSize="sm">Runs: {formatLargeNumber(model.runs)}</Text>
            <Text fontSize="sm">Rank: {rank}</Text>
          </Box>
          <Box>
            <Text fontSize="sm">
              Cost: {model.costToRun ? `$${model.costToRun}` : "$-"}
            </Text>
            <Text fontSize="sm">
              Hardware: {model.predictionHardware || "N/A"}
            </Text>
          </Box>
        </HStack>
        <Link href={`/models/${model?.platform}/${model?.id}`} passHref>
          <Button size="sm" colorScheme="blue" alignSelf="flex-start">
            View model details
          </Button>
        </Link>
      </Box>
    );
  }
};

export default ModelCard;
