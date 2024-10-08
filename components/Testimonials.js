import React from "react";
import { Box, Text, SimpleGrid, Avatar } from "@chakra-ui/react";

const Testimonials = () => {
  return (
    <SimpleGrid columns={[1, 2, 2, 4]} spacing={8}>
      <Box bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
        <Box p={6}>
          <Text fontSize="xl" mb={4}>
            &quot;AI Models is consistently three weeks ahead of Twitter. Since
            subscribing I&apos;ve been able to mute all the AI influencers and
            am better informed than ever.&quot;
          </Text>
          <Box display="flex" alignItems="center">
            <Avatar
              size="md"
              name="Philip P."
              src="https://media.licdn.com/dms/image/C5603AQFhkTZjZxF6cQ/profile-displayphoto-shrink_100_100/0/1627310111771?e=1727308800&v=beta&t=4XvMSyMAxkjKaoljd7A0jkVYM6j2NSWdCWCtzUVwOqg"
              mr={4}
            />
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
            <Avatar
              size="md"
              name="Andy M."
              src="https://pbs.twimg.com/profile_images/1967113482/Ink-meNEWa_400x400.png"
              mr={4}
            />
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
            ideas to dig deep and learn this amazingly fast-paced field, and for
            that we thank you.&quot;
          </Text>
          <Box display="flex" alignItems="center">
            <Avatar
              size="md"
              name="The AC guys"
              src="https://substackcdn.com/image/fetch/w_88,h_88,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack.com%2Fimg%2Favatars%2Fyellow.png"
              mr={4}
            />
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
            &quot;So many AI newsletters focus on the big-ticket industry news
            items (e.g. the latest model releases, or which company bought a
            different company, etc.). But as an actual practitioner and educator
            in AI and NLP, I need a way to keep up to date on the latest{" "}
            <span style={{ fontWeight: "bold" }}>research</span>.... you do just
            that!&quot;
          </Text>
          <Box display="flex" alignItems="center">
            <Avatar
              size="md"
              name="Christian Monson"
              src="https://media.licdn.com/dms/image/C5603AQFAiqtIGY2xnw/profile-displayphoto-shrink_200_200/0/1572043262163?e=1727308800&v=beta&t=OBvwxjJJiUomhm9VzeshifLT09_L8Qw7zgYOIoyj8_w"
              mr={4}
            />
            <Box>
              <Text fontWeight="bold">Christian Monson</Text>
              <Text fontSize="sm" color="gray.500">
                Tutor and mentor, AI, Machine Learning, and NLP
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </SimpleGrid>
  );
};

export default Testimonials;
