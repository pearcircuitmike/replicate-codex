import { Box, Heading, Image, Link, Text } from "@chakra-ui/react";
import PreviewImage from "./PreviewImage";

export default function SimilarCreators({ similarCreators, data }) {
  return (
    <Box>
      <Heading as="h2" size="lg" my="8">
        Similar Creators
      </Heading>
      <Text>
        A creator is considered similar if they produce models of the same type
        or with the same tags. Based on the data we have, you can see the list
        of similar creators below.
      </Text>

      {similarCreators && similarCreators.length === 0 ? (
        <Text>No similar creators found.</Text>
      ) : (
        <Box mt="12" display="flex" flexWrap="wrap">
          {similarCreators &&
            similarCreators.map((creator) => {
              const creatorModels =
                data &&
                data.filter(
                  (item) => item.creator.toLowerCase() === creator.toLowerCase()
                );
              const totalRuns = creatorModels
                ? creatorModels.reduce((acc, curr) => acc + curr.runs, 0)
                : 0;
              const previewImage =
                creatorModels && creatorModels[0]
                  ? creatorModels[0].example
                  : "https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png";
              const creatorTotalModels = creatorModels
                ? creatorModels.length
                : 0;

              return (
                <Box
                  key={creator}
                  width={{ base: "100%", sm: "50%", md: "33%", lg: "25%" }}
                  p="4"
                >
                  <PreviewImage
                    src={previewImage}
                    w="full"
                    h="64"
                    objectFit="cover"
                    mb="4"
                  />
                  <Box p="6">
                    <Heading as="h3" size="lg" mb="2">
                      <Link
                        href={`/creators/${
                          data.platform
                        }/${creator.toLowerCase()}`}
                      >
                        {creator}
                      </Link>
                    </Heading>
                    <Box d="flex" alignItems="baseline">
                      <Text>Runs: {totalRuns}</Text>
                      <Text> Total models: {creatorTotalModels}</Text>
                    </Box>
                    <Box>
                      <Link
                        href={`/creators/${
                          data.platform
                        }/${creator.toLowerCase()}`}
                      >
                        <span
                          style={{ textDecoration: "underline", color: "teal" }}
                        >
                          View creator page
                        </span>
                      </Link>
                    </Box>
                  </Box>
                </Box>
              );
            })}
        </Box>
      )}
    </Box>
  );
}
