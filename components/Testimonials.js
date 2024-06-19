import React from "react";
import { Box, Text, SimpleGrid } from "@chakra-ui/react";

const Testimonials = () => {
  return (
    <SimpleGrid columns={[1, 1, 2]} spacing={8}>
      <Box bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
        <Box p={6}>
          <Text fontSize="xl" mb={4}>
            &quot;AImodels.fyi&apos;s summaries are my cheat code. They&apos;ve
            helped me rapidly parse my options based on new research and then
            implement them in my code.&quot;
          </Text>
          <Box display="flex" alignItems="center">
            <Box
              borderRadius="full"
              width="48px"
              height="48px"
              overflow="hidden"
              mr={4}
            >
              <img
                src="https://media.licdn.com/dms/image/C5603AQFhkTZjZxF6cQ/profile-displayphoto-shrink_100_100/0/1627310111771?e=1720656000&v=beta&t=b-b_lq8TiGtu29b5XVBB2Ohj3GtYIETUylajANz9rFg"
                alt="Philip"
              />
            </Box>
            <Box>
              <Text fontWeight="bold">Philip P.</Text>
              <Text fontSize="sm" color="gray.500">
                AI Founder
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
        <Box p={6}>
          <Text fontSize="xl" mb={4}>
            &quot;The most comprehensive and meaningful index of AI models that
            are both emerging and production-ready so I can focus on building
            without getting left behind.&quot;
          </Text>
          <Box display="flex" alignItems="center">
            <Box
              borderRadius="full"
              width="48px"
              height="48px"
              overflow="hidden"
              mr={4}
            >
              <img
                src="https://pbs.twimg.com/profile_images/1967113482/Ink-meNEWa_400x400.png"
                alt="Andy"
              />
            </Box>
            <Box>
              <Text fontWeight="bold">Andy M.</Text>
              <Text fontSize="sm" color="gray.500">
                Founder, Safemail AI
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
        <Box p={6}>
          <Text fontSize="xl" mb={4}>
            &quot;It makes it easier for us that don&apos;t have the time or
            ideas to dig deep learn this amazingly fast paced field, and for
            that we thank you&quot;
          </Text>
          <Box display="flex" alignItems="center">
            <Box
              borderRadius="full"
              width="48px"
              height="48px"
              overflow="hidden"
              mr={4}
            >
              <img
                src="https://substackcdn.com/image/fetch/w_88,h_88,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack.com%2Fimg%2Favatars%2Fyellow.png"
                alt="Anon"
              />
            </Box>
            <Box>
              <Text fontWeight="bold">The AC guys</Text>
              <Text fontSize="sm" color="gray.500">
                Anon.
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
        <Box p={6}>
          <Text fontSize="xl" mb={4}>
            &quot;So many A.I. Newsletters focus on the big-ticket industry news
            items (e.g. the latest model releases, or which company bought a
            different company, etc.) But as an actual practitioner and educator
            in A.I. and NLP, I need a way to keep up to date on the latest{" "}
            <span style={{ fontWeight: "bold" }}>research</span>.... you do just
            that!&quot;
          </Text>
          <Box display="flex" alignItems="center">
            <Box
              borderRadius="full"
              width="48px"
              height="48px"
              overflow="hidden"
              mr={4}
            >
              <img
                src="https://media.licdn.com/dms/image/C5603AQFAiqtIGY2xnw/profile-displayphoto-shrink_800_800/0/1572043262240?e=1720656000&v=beta&t=boEhSBYDd0qNfWON1I6aNL1x3CMd8YvVHUruX6zEVok"
                alt="Christian Monson"
              />
            </Box>
            <Box>
              <Text fontWeight="bold">Christian Monson</Text>
              <Text fontSize="sm" color="gray.500">
                Tutor and mentor, A.I., Machine Learning, and NLP
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </SimpleGrid>
  );
};

export default Testimonials;
