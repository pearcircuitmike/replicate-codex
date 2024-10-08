import React from "react";
import { Box, Text, SimpleGrid, Avatar } from "@chakra-ui/react";

const Testimonials = () => {
  return (
<<<<<<< Updated upstream
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
=======
    <Box maxWidth="400px" margin="0 auto">
      <Slider {...settings}>
        {testimonialsData.map((testimonial, index) => (
          <Box key={index} p={2}>
            <Flex
              direction="column"
              alignItems="center"
              bg="white"
              borderRadius="md"
              boxShadow="md"
              p={6}
              justifyContent="space-between"
            >
              <Text fontSize="md" textAlign="center" mb={4} color="gray.600">
                &quot;{testimonial.text}&quot;
>>>>>>> Stashed changes
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
            ideas to dig deep learn this amazingly fast paced field, and for
            that we thank you&quot;
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
            &quot;So many A.I. Newsletters focus on the big-ticket industry news
            items (e.g. the latest model releases, or which company bought a
            different company, etc.) But as an actual practitioner and educator
            in A.I. and NLP, I need a way to keep up to date on the latest{" "}
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
                Tutor and mentor, A.I., Machine Learning, and NLP
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
        <Box p={6}>
          <Text fontSize="xl" mb={4}>
            &quot;I was looking for a place where I can learn more about AI
            models without having to go through the twitter-sphere to learn more
            about new AI models that are coming out and came across you website.
            I really enjoyed your website and I decided to join the
            discord!&quot;
          </Text>
          <Box display="flex" alignItems="center">
            <Avatar
              size="md"
              name="Joel Mushagasha"
              src="https://media.licdn.com/dms/image/v2/D4E03AQEHkLNO_kuAqQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1696342959561?e=1729728000&v=beta&t=LDs78TGO_SjnQNwnFPN5IsYhqEe3NBu5QU6eFBbbV0Q"
              mr={4}
            />
            <Box>
              <Text fontWeight="bold">Joel Mushagasha</Text>
              <Text fontSize="sm" color="gray.500">
                Computational Biochemist, Biomedical Engineering, AI Engineer
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
        <Box p={6}>
          <Text fontSize="xl" mb={4}>
            &quot;The bite-sized recaps are very helpful! The current summary
            length is perfect.&quot;
          </Text>
          <Box display="flex" alignItems="center">
            <Avatar
              size="md"
              name="Joe"
              src="https://pbs.twimg.com/profile_images/1497682972429877249/huKZ_1vH_400x400.png"
              mr={4}
            />
            <Box>
              <Text fontWeight="bold">Joe</Text>
              <Text fontSize="sm" color="gray.500">
                AI & DAO
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
        <Box p={6}>
          <Text fontSize="xl" mb={4}>
            &quot;Solid weekly updates about AI models on Replicate.&quot;
          </Text>
          <Box display="flex" alignItems="center">
            <Avatar
              size="md"
              name="Daniel Nest"
              src="https://pbs.twimg.com/profile_images/1646049735575207937/8uKnd3QL_400x400.jpg"
              mr={4}
            />
            <Box>
              <Text fontWeight="bold">Daniel Nest</Text>
              <Text fontSize="sm" color="gray.500">
                Founder, Why Try AI
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </SimpleGrid>
  );
};

export default Testimonials;
