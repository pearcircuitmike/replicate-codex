import React from "react";
import {
  Box,
  Heading,
  Text,
  Link as ChakraLink,
  Image,
  Tag,
  Flex,
  Tooltip,
} from "@chakra-ui/react";
import Link from "next/link";
import EmojiWithGradient from "../EmojiWithGradient";
import BookmarkButton from "../BookmarkButton";
import { formatLargeNumber } from "@/pages/api/utils/formatLargeNumber";

const PaperCard = ({ paper, onBookmarkChange }) => {
  const {
    id,
    title,
    authors,
    abstract,
    publishedDate,
    indexedDate,
    thumbnail,
    platform,
    slug,
    totalScore,
  } = paper;

  const isNew = React.useMemo(() => {
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
    return new Date(indexedDate) >= seventyTwoHoursAgo;
  }, [indexedDate]);

  const formattedDate = React.useMemo(
    () => new Date(publishedDate).toLocaleDateString(),
    [publishedDate]
  );

  return (
    <Box
      as={Link}
      href={`/papers/${encodeURIComponent(platform)}/${encodeURIComponent(
        slug
      )}`}
      w="100%"
      h="100%"
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="base"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      rounded="md"
      bg="white"
      overflow="hidden"
      transition="transform 0.2s ease, box-shadow 0.2s ease"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "lg",
      }}
      cursor="pointer"
    >
      <Box h="250px" overflow="hidden" position="relative">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            objectFit="cover"
            w="100%"
            h="100%"
            loading="lazy"
          />
        ) : (
          <EmojiWithGradient title={title} />
        )}
        <Tooltip label="Calculated based on factors such as likes, downloads, etc">
          <Flex
            position="absolute"
            bottom="10px"
            right="10px"
            bg="white"
            borderRadius="md"
            p="4px 8px"
            alignItems="center"
            boxShadow="md"
          >
            <Image
              src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/fire.png"
              alt="Total Score"
              boxSize="16px"
              mr={1}
            />
            <Text fontSize="sm" fontWeight="bold">
              {formatLargeNumber(Math.floor(totalScore))}
            </Text>
          </Flex>
        </Tooltip>
      </Box>
      <Box p="15px">
        <Heading
          as="h3"
          size="sm"
          noOfLines={3}
          mb={1}
          style={{ whiteSpace: "normal", wordWrap: "break-word" }}
        >
          {isNew && (
            <Tag size="md" colorScheme="green" mr="5px">
              New!
            </Tag>
          )}
          {title}
        </Heading>
        <Text fontSize="sm" color="gray.500" noOfLines={2} mb={2}>
          {authors.join(", ")}
        </Text>
        <Text fontSize="sm" noOfLines={4}>
          {abstract || "No abstract available."}
        </Text>
        <Text
          as="span"
          fontSize="sm"
          color="blue.500"
          _hover={{
            color: "blue.700",
          }}
        >
          Read more
        </Text>
      </Box>
      <Flex
        justify="space-between"
        mt="auto"
        mb="10px"
        spacing={5}
        pl="15px"
        pr="15px"
      >
        <Text fontSize="sm">{formattedDate}</Text>
      </Flex>
    </Box>
  );
};

export default PaperCard;
