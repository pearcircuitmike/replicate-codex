// pages/trending.js
import { useRouter } from "next/router";
import {
  Box,
  Heading,
  Text,
  Container,
  VStack,
  HStack,
  Spacer,
  Button,
  Image,
  Center,
  Link,
} from "@chakra-ui/react";
import NextLink from "next/link";
import MetaTags from "../components/MetaTags";
import { fetchTrendingPapers } from "../utils/fetchTrendingPapers";
import EmojiWithGradient from "@/components/EmojiWithGradient";

const getStartOfWeek = (date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  return startOfWeek;
};

export default function Trending({ trendingPapers, startDate }) {
  const router = useRouter();

  const handlePrevWeek = () => {
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - 7);
    router.push(`/trending?startDate=${prevStartDate.toISOString()}`);
  };

  const handleNextWeek = () => {
    const nextStartDate = new Date(startDate);
    nextStartDate.setDate(nextStartDate.getDate() + 7);
    const currentDate = getStartOfWeek(new Date());
    if (nextStartDate <= currentDate) {
      router.push(`/trending?startDate=${nextStartDate.toISOString()}`);
    }
  };

  return (
    <>
      <MetaTags
        title="Trending Research | AIModels.fyi"
        description="Discover the top trending AI research papers."
      />
      <Container maxW="4xl">
        <Box as="main" p={6}>
          <Heading as="h1" size="xl" mb={4}>
            Trending Research
          </Heading>
          <Text fontSize="xl" mb={8}>
            Explore the most popular and trending AI research, as measured by
            stars, upvotes, likes, and more.
          </Text>
          <Container maxW="container.md">
            <Box mt={8}>
              <Text fontWeight="bold" fontSize="lg" mb={4} align="center">
                Get summaries of the top AI research delivered straight to your
                inbox:
              </Text>
            </Box>

            <Box>
              <div id="custom-substack-embed"></div>
              <iframe
                src="https://aimodels.substack.com/embed"
                width="100%"
                height="auto"
                border="0px solid #EEE"
                bg="white"
              ></iframe>
            </Box>
          </Container>

          <Text mb={4}>
            Week: {new Date(startDate).toLocaleDateString()} -{" "}
            {new Date(
              new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000
            ).toLocaleDateString()}
          </Text>

          <HStack my={8}>
            <Button onClick={handlePrevWeek}>Previous Week</Button>
            <Spacer />
            <Button
              onClick={handleNextWeek}
              isDisabled={
                new Date(
                  new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000
                ) > getStartOfWeek(new Date())
              }
            >
              Next Week
            </Button>
          </HStack>

          <VStack spacing={4} align="stretch">
            {trendingPapers.map((paper) => (
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
                        <Text fontWeight="bold">{paper.title}</Text>
                        <Text fontSize="sm">
                          Indexed Date:{" "}
                          {new Date(paper.indexedDate).toLocaleDateString()}
                        </Text>
                        <HStack mt={2}>
                          <Image
                            src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png"
                            alt="Total Score"
                            boxSize="24px"
                            mr={2}
                          />
                          <Text>{Math.floor(paper.totalScore)}</Text>
                        </HStack>
                      </VStack>
                      <Spacer />
                      <Center height="100%">
                        {paper.thumbnail && (
                          <Image
                            src={paper.thumbnail || paper.emojiWithGradient}
                            alt={paper.title}
                            boxSize="80px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                        )}
                        {!paper.thumbnail && (
                          <EmojiWithGradient
                            title={paper.title}
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
      </Container>
    </>
  );
}

export async function getServerSideProps(context) {
  const { startDate: startDateQuery } = context.query;
  const startDate = startDateQuery
    ? new Date(startDateQuery)
    : getStartOfWeek(new Date());
  const trendingPapers = await fetchTrendingPapers("arxiv", startDate);
  return {
    props: {
      trendingPapers,
      startDate: startDate.toISOString(),
    },
  };
}
