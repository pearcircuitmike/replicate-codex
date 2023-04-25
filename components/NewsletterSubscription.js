import React from "react";
import { Box, Heading, Text, chakra } from "@chakra-ui/react";

const NewsletterSubscription = () => {
  return (
    <>
      <Box border="1px" borderColor="gray.200" p={4} my={5}>
        <Heading as="h3" size="sm" textAlign="center" mt={3}>
          Don&rsquo;t miss the next big thing in AI
        </Heading>
        <Text fontSize="md" textAlign="center">
          Get a free monthly summary of new and trending AI models.
        </Text>

        <Box>
          <div id="custom-substack-embed"></div>

          <iframe
            src="https://replicatecodex.substack.com/embed"
            width="100%"
            height="auto"
            border="0px solid #EEE"
            bg="white"
          ></iframe>
        </Box>
      </Box>
    </>
  );
};

export default NewsletterSubscription;
