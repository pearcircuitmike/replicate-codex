import React from "react";
import { Box, Container, Image } from "@chakra-ui/react";
import EmojiWithGradient from "@/components/EmojiWithGradient";

const PaperHero = ({ paper, children }) => {
  return (
    <Box position="relative" mb={8}>
      {/* Background Image/Gradient */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="450px"
        overflow="hidden"
        zIndex={-1}
      >
        {paper.thumbnail ? (
          <>
            {/* Dark gradient overlay */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.8) 100%)"
              zIndex={1}
            />

            {/* Background image */}
            <Image
              src={paper.thumbnail}
              alt=""
              objectFit="cover"
              w="100%"
              h="100%"
              filter="blur(4px) brightness(.9)"
              transform="scale(1.1)"
            />
          </>
        ) : (
          <Box position="relative" h="100%">
            <EmojiWithGradient
              title={paper.title}
              height="100%"
              opacity={0.15}
            />
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.7) 100%)"
            />
          </Box>
        )}
      </Box>

      {/* Content */}
      <Container maxW="container.md" position="relative" pt={12}>
        {children}
      </Container>
    </Box>
  );
};

export default PaperHero;
