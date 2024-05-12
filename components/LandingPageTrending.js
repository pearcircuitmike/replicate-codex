// components/LandingPageTrending.js
import React from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Spacer,
  Image,
  Center,
  Link,
  SimpleGrid,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import NextLink from "next/link";
import EmojiWithGradient from "@/components/EmojiWithGradient";
import { formatLargeNumber } from "@/utils/formatLargeNumber";

const LandingPageTrending = ({
  trendingModels,
  trendingPapers,
  trendingCreators,
  trendingAuthors,
  isLoading,
}) => {
  const renderSkeletonCard = () => (
    <Box p={4} borderWidth={1} borderRadius="md">
      <HStack align="center">
        <VStack align="start" spacing={1} flex={1}>
          <Skeleton height="20px" width="80%" />
          <SkeletonText mt={2} noOfLines={2} spacing={2} />
        </VStack>
        <SkeletonCircle size="80px" />
      </HStack>
    </Box>
  );

  return (
    <Box px={"5vw"} color="gray.700">
      <SimpleGrid columns={[1, 2, 2, 4]} spacing={8}>
        {/* Trending Papers */}
        <Box>
          <Heading as="h2" size="md" mb={4}>
            Breakout papers
          </Heading>
          <VStack spacing={4} align="stretch">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <React.Fragment key={index}>
                    {renderSkeletonCard()}
                  </React.Fragment>
                ))
              : trendingPapers.map((paper) => (
                  <NextLink
                    key={paper.id}
                    href={`/papers/${encodeURIComponent(
                      paper.platform
                    )}/${encodeURIComponent(paper.slug)}`}
                    passHref
                  >
                    <Link _hover={{ textDecoration: "none" }}>
                      <Box
                        p={4}
                        borderWidth={1}
                        borderRadius="md"
                        _hover={{ boxShadow: "md" }}
                      >
                        <HStack align="center">
                          <VStack align="start" spacing={1}>
                            <Text
                              fontWeight="bold"
                              noOfLines={2}
                              overflow="hidden"
                              textOverflow="ellipsis"
                            >
                              {paper.title}
                            </Text>

                            <HStack mt={2}>
                              <Image
                                src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/fire.png"
                                alt="Total Score"
                                boxSize="20px"
                                mr={1}
                              />
                              <Text>{Math.floor(paper.totalScore)}</Text>
                            </HStack>
                          </VStack>
                          <Spacer />
                          <Center height="100%">
                            {paper.thumbnail && (
                              <Image
                                src={paper.thumbnail}
                                alt={paper.title}
                                height="80px"
                                minWidth="80px"
                                objectFit="cover"
                                borderRadius="md"
                              />
                            )}
                            {!paper.thumbnail && (
                              <EmojiWithGradient
                                title={paper.title || "Paper"}
                                height="80px"
                                width="80px"
                                objectFit="cover"
                              />
                            )}
                          </Center>
                        </HStack>
                      </Box>
                    </Link>
                  </NextLink>
                ))}
          </VStack>
        </Box>

        {/* Trending Authors */}
        <Box>
          <Heading as="h2" size="md" mb={4}>
            Star researchers
          </Heading>
          <VStack spacing={4} align="stretch">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <React.Fragment key={index}>
                    {renderSkeletonCard()}
                  </React.Fragment>
                ))
              : trendingAuthors.map((author, index) => (
                  <NextLink
                    key={index}
                    href={`/authors/${encodeURIComponent(
                      "arxiv"
                    )}/${encodeURIComponent(author)}`}
                    passHref
                  >
                    <Link _hover={{ textDecoration: "none" }}>
                      <Box
                        p={4}
                        borderWidth={1}
                        borderRadius="md"
                        _hover={{ boxShadow: "md" }}
                      >
                        <HStack align="center">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">{author}</Text>
                            <Text fontSize="sm">Platform: arxiv</Text>
                            <HStack mt={2}>
                              <Image
                                src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/fire.png"
                                alt="Total Score"
                                boxSize="20px"
                                mr={1}
                              />
                              <Text>{formatLargeNumber(Math.floor(10))}</Text>
                            </HStack>
                          </VStack>
                          <Spacer />
                          <Center height="100%">
                            <EmojiWithGradient
                              title={author || "Author"}
                              height="80px"
                              width="80px"
                              objectFit="cover"
                            />
                          </Center>
                        </HStack>
                      </Box>
                    </Link>
                  </NextLink>
                ))}
          </VStack>
        </Box>

        {/* Trending Models */}
        <Box>
          <Heading as="h2" size="md" mb={4}>
            Trending models
          </Heading>
          <VStack spacing={4} align="stretch">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <React.Fragment key={index}>
                    {renderSkeletonCard()}
                  </React.Fragment>
                ))
              : trendingModels.map((model) => (
                  <NextLink
                    key={model.id}
                    href={`/models/${model.platform}/${encodeURIComponent(
                      model.slug
                    )}`}
                    passHref
                  >
                    <Link _hover={{ textDecoration: "none" }}>
                      <Box
                        p={4}
                        borderWidth={1}
                        borderRadius="md"
                        _hover={{ boxShadow: "md" }}
                      >
                        <HStack align="center">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">{model.modelName}</Text>
                            <Text fontSize="sm">Creator: {model.creator}</Text>
                            <HStack mt={2}>
                              <Image
                                src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/fire.png"
                                alt="Total Score"
                                boxSize="20px"
                                mr={1}
                              />
                              <Text>
                                {formatLargeNumber(
                                  Math.floor(model.totalScore)
                                )}
                              </Text>
                            </HStack>
                          </VStack>
                          <Spacer />
                          <Center height="100%">
                            {model.example && (
                              <Image
                                src={model.example}
                                alt={model.modelName}
                                boxSize="80px"
                                objectFit="cover"
                                borderRadius="md"
                              />
                            )}
                            {!model.example && (
                              <EmojiWithGradient
                                title={model.modelName || "Paper"}
                                height="80px"
                                width="80px"
                                objectFit="cover"
                              />
                            )}
                          </Center>
                        </HStack>
                      </Box>
                    </Link>
                  </NextLink>
                ))}
          </VStack>
        </Box>

        {/* Trending Creators */}
        <Box>
          <Heading as="h2" size="md" mb={4}>
            Top builders
          </Heading>
          <VStack spacing={4} align="stretch">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <React.Fragment key={index}>
                    {renderSkeletonCard()}
                  </React.Fragment>
                ))
              : trendingCreators.map((creator) => (
                  <NextLink
                    key={creator.id}
                    href={`/creators/${encodeURIComponent(
                      creator.platform
                    )}/${encodeURIComponent(creator.creator)}`}
                    passHref
                  >
                    <Link _hover={{ textDecoration: "none" }}>
                      <Box
                        p={4}
                        borderWidth={1}
                        borderRadius="md"
                        _hover={{ boxShadow: "md" }}
                      >
                        <HStack align="center">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">{creator.creator}</Text>
                            <Text fontSize="sm">
                              Platform: {creator.platform}
                            </Text>
                            <HStack mt={2}>
                              <Image
                                src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/fire.png"
                                alt="Total Score"
                                boxSize="20px"
                                mr={1}
                              />
                              <Text>
                                {formatLargeNumber(
                                  Math.floor(creator.totalCreatorScore)
                                )}
                              </Text>
                            </HStack>
                          </VStack>
                          <Spacer />
                          <Center height="100%">
                            <EmojiWithGradient
                              title={creator.creator || "Creator"}
                              height="80px"
                              width="80px"
                              objectFit="cover"
                            />
                          </Center>
                        </HStack>
                      </Box>
                    </Link>
                  </NextLink>
                ))}
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default LandingPageTrending;
